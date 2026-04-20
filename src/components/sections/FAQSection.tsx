"use client";

import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface FAQSectionProps {
  faqs: { question: string; answer: string }[];
  title?: string;
}

export function FAQSection({
  faqs,
  title = "Frequently Asked Questions",
}: FAQSectionProps) {
  const [expanded, setExpanded] = useState<number | false>(0);

  return (
    <Box
      component="section"
      sx={{ py: 9, bgcolor: "#fff" }}
      aria-label="Frequently asked questions"
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Box
            sx={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              color: "#15803d",
              textTransform: "uppercase",
              letterSpacing: ".1em",
              bgcolor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 999,
              px: 2,
              py: 0.6,
              mb: 1.5,
            }}
          >
            FAQ
          </Box>
          <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 36 } }}>
            {title}
          </Typography>
        </Box>

        <Box>
          {faqs.map(({ question, answer }, index) => (
            <Accordion
              key={question}
              expanded={expanded === index}
              onChange={(_, isExpanded) => setExpanded(isExpanded ? index : false)}
              elevation={0}
              sx={{
                border: "1.5px solid",
                borderColor: expanded === index ? "#16a34a" : "#e2e8f0",
                borderRadius: "12px !important",
                mb: 1.5,
                "&:before": { display: "none" },
                "&.Mui-expanded": { mt: 0, mb: 1.5 },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon sx={{ color: expanded === index ? "#16a34a" : "#64748b" }} />
                }
                sx={{ px: 3, py: 1, "& .MuiAccordionSummary-content": { my: 1.5 } }}
              >
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: expanded === index ? "#15803d" : "#0f172a",
                    lineHeight: 1.4,
                  }}
                >
                  {question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 2.5 }}>
                <Typography sx={{ fontSize: 14, color: "#475569", lineHeight: 1.75 }}>
                  {answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
