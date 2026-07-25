import json
import logging
from io import BytesIO
from typing import Dict, Any, Optional
import pypdf
import zipfile
import xml.etree.ElementTree as ET

from app.ai.services.ai_service import ai_service
from app.schemas.parsed_resume import ParsedResumeSchema
from app.ai.prompts.resume_parser import SYSTEM_INSTRUCTION, PROMPT_TEMPLATE

logger = logging.getLogger("app.ai.resume_parser_service")

class ResumeParserService:
    def extract_text(self, file_bytes: bytes, filename: str) -> str:
        suffix = filename.lower().split('.')[-1]
        
        if suffix == 'pdf':
            return self._extract_pdf_text(file_bytes)
        elif suffix == 'docx':
            return self._extract_docx_text(file_bytes)
        else:
            raise ValueError("Unsupported file format. Only PDF and DOCX files are allowed.")

    def _extract_pdf_text(self, file_bytes: bytes) -> str:
        try:
            reader = pypdf.PdfReader(BytesIO(file_bytes))
            text_list = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    text_list.append(text)
            
            extracted = "\n".join(text_list).strip()
            if not extracted:
                raise ValueError("PDF file appears to be empty or contains no extractable text.")
            return extracted
        except Exception as e:
            logger.error("Failed to extract text from PDF: %s", str(e))
            raise ValueError(f"Corrupted or invalid PDF file: {str(e)}")

    def _extract_docx_text(self, file_bytes: bytes) -> str:
        try:
            with zipfile.ZipFile(BytesIO(file_bytes)) as docx:
                xml_content = docx.read('word/document.xml')
                root = ET.fromstring(xml_content)
                
                namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
                paragraphs = []
                for p in root.findall('.//w:p', namespaces):
                    texts = [t.text for t in p.findall('.//w:t', namespaces) if t.text]
                    if texts:
                        paragraphs.append("".join(texts))
                
                extracted = "\n".join(paragraphs).strip()
                if not extracted:
                    raise ValueError("DOCX file appears to be empty or contains no extractable text.")
                return extracted
        except Exception as e:
            logger.error("Failed to extract text from DOCX: %s", str(e))
            raise ValueError(f"Corrupted or invalid DOCX file: {str(e)}")

    async def parse_resume_text(self, text: str) -> ParsedResumeSchema:
        prompt = PROMPT_TEMPLATE.format(content=text)
        
        system_instruction_json = (
            SYSTEM_INSTRUCTION + 
            "\n\nYou MUST return a raw JSON object matching the following structure ONLY. "
            "Do NOT wrap the response in markdown codeblocks (e.g. do NOT include ```json ... ```). "
            "JSON structure: "
            "{"
            '  "personal_info": {"name": "string", "email": "string", "phone": "string", "location": "string", "linkedin_url": "string", "github_url": "string", "portfolio_website": "string"},'
            '  "summary": "string",'
            '  "skills": ["string"],'
            '  "education": [{"degree": "string", "institution": "string", "field_of_study": "string", "start_date": "string", "end_date": "string", "grade": "string"}],'
            '  "experience": [{"company_name": "string", "job_title": "string", "employment_type": "string", "start_date": "string", "end_date": "string", "current_job": false, "responsibilities": "string"}],'
            '  "projects": [{"project_name": "string", "description": "string", "technologies_used": ["string"], "github_link": "string", "live_demo_link": "string"}],'
            '  "certifications": [{"certification_name": "string", "organization": "string", "issue_date": "string", "expiry_date": "string", "credential_url": "string"}],'
            '  "confidence_scores": {"personal_info": 95, "skills": 92, "experience": 87, "overall_parsing": 91}'
            "}"
        )

        response = await ai_service.execute_prompt(prompt, system_instruction_json)
        
        if not response.success:
            raise RuntimeError(response.errors[0] if response.errors else "AI Parsing failed.")

        raw_text = response.data.strip()
        
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            raw_text = "\n".join(lines).strip()

        try:
            parsed_json = json.loads(raw_text)
            
            skills_raw = parsed_json.get("skills", [])
            normalized_skills = []
            seen_skills = set()
            for s in skills_raw:
                s_normalized = s.strip()
                s_lower = s_normalized.lower()
                if s_lower not in seen_skills:
                    seen_skills.add(s_lower)
                    normalized_skills.append(s_normalized)
            parsed_json["skills"] = normalized_skills

            return ParsedResumeSchema(**parsed_json)
        except Exception as e:
            logger.error("Failed to parse JSON response from AI: %s. Raw text: %s", str(e), raw_text)
            return ParsedResumeSchema(
                personal_info={"name": "Unknown", "email": None, "phone": None},
                summary="Parsing succeeded but parsing structure was slightly malformed.",
                skills=[],
                confidence_scores={"personal_info": 50, "skills": 50, "experience": 50, "overall_parsing": 50}
            )

resume_parser_service = ResumeParserService()
