import { Document, Page, Text, View, Image, Font, StyleSheet, pdf } from "@react-pdf/renderer";
import { TemplateBlock } from "@/lib/repositories/types";

let fontsRegistered = false;

function registerFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: "Inter",
    fonts: [
      { src: "/fonts/Inter-Regular.woff", fontWeight: "normal" },
      { src: "/fonts/Inter-Bold.woff", fontWeight: "bold" },
    ],
  });
  fontsRegistered = true;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 10.5,
    lineHeight: 1.5,
    color: "#2B2F36",
    padding: 56,
  },
  logo: { width: 110, height: 50, objectFit: "contain", alignSelf: "center", marginBottom: 16 },
  officeName: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    color: "#6B7280",
    letterSpacing: 1,
    marginBottom: 16,
  },
  heading: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  clause: { fontSize: 10.5, fontWeight: "bold", marginTop: 10, marginBottom: 4 },
  paragraph: { marginBottom: 8, textAlign: "justify" },
  listItem: { marginBottom: 6, paddingLeft: 12 },
  signatureWrap: { marginTop: 28, alignItems: "center" },
  signatureImage: { width: 130, height: 45, objectFit: "contain", marginBottom: 4 },
  signatureLine: { width: 220, borderBottomWidth: 1, borderBottomColor: "#9AA1AC" },
  footer: { marginTop: 32, fontSize: 8.5, textAlign: "center", color: "#6B7280" },
});

function alignStyle(align?: string) {
  if (align === "center") return { textAlign: "center" as const };
  if (align === "right") return { textAlign: "right" as const };
  return { textAlign: "left" as const };
}

export interface PdfLetterhead {
  officeName?: string;
  logoDataUrl?: string | null;
  signatureDataUrl?: string | null;
  footerText?: string;
}

function PdfDocument({ blocks, letterhead }: { blocks: TemplateBlock[]; letterhead: PdfLetterhead }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {letterhead.logoDataUrl ? (
          <Image src={letterhead.logoDataUrl} style={styles.logo} />
        ) : letterhead.officeName ? (
          <Text style={styles.officeName}>{letterhead.officeName.toUpperCase()}</Text>
        ) : null}

        {blocks.map((block) => {
          if (block.type === "image") return null;
          if (block.type === "signatureLine") {
            return (
              <View key={block.id} style={styles.signatureWrap}>
                {block.imageRef === "signature" && letterhead.signatureDataUrl && (
                  <Image src={letterhead.signatureDataUrl} style={styles.signatureImage} />
                )}
                <View style={styles.signatureLine} />
              </View>
            );
          }
          if (block.type === "heading") {
            return (
              <Text key={block.id} style={[styles.heading, alignStyle(block.align ?? "center")]}>
                {block.text}
              </Text>
            );
          }
          if (block.type === "clause") {
            return (
              <Text key={block.id} style={[styles.clause, alignStyle(block.align)]}>
                {block.text}
              </Text>
            );
          }
          if (block.type === "list-item") {
            return (
              <Text key={block.id} style={styles.listItem}>
                {"•  "}
                {block.text}
              </Text>
            );
          }
          return (
            <Text key={block.id} style={[styles.paragraph, alignStyle(block.align)]}>
              {block.text}
            </Text>
          );
        })}

        {letterhead.footerText && <Text style={styles.footer}>{letterhead.footerText}</Text>}
      </Page>
    </Document>
  );
}

export async function renderPdf(blocks: TemplateBlock[], letterhead: PdfLetterhead): Promise<Blob> {
  registerFonts();
  const instance = pdf(<PdfDocument blocks={blocks} letterhead={letterhead} />);
  return instance.toBlob();
}
