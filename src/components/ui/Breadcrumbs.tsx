import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NextLink from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <Box sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0", py: 1.5 }}>
      <Container maxWidth="lg">
        <MuiBreadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: "#94a3b8" }} />}
          aria-label="breadcrumb"
        >
          {crumbs.map(({ label, href }, index) =>
            href ? (
              <Link
                key={`${label}-${index}`}
                component={NextLink}
                href={href}
                underline="hover"
                sx={{ fontSize: 13, color: "#475569", "&:hover": { color: "#16a34a" } }}
              >
                {label}
              </Link>
            ) : (
              <Typography
                key={`${label}-${index}`}
                sx={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}
              >
                {label}
              </Typography>
            ),
          )}
        </MuiBreadcrumbs>
      </Container>
    </Box>
  );
}
