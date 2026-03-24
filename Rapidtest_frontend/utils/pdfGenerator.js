// utils/pdfGenerator.js
import { Document, Page, Text, StyleSheet } from '@react-pdf/renderer';

export const generatePdf = (referralData) => {
  const styles = StyleSheet.create({
    page: {
      fontSize: 12,
      fontFamily: 'Helvetica',
      margin: 30,
    },
    header: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    section: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    text: {
      fontSize: 12,
    },
    footer: {
      marginTop: 20,
      fontSize: 10,
      textAlign: 'center',
    },
  });

  const document = (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.header}>{referralData.title}</Text>

        <Text style={[styles.section, styles.sectionTitle]}>Patient Details</Text>
        <Text style={styles.text}>Name: {referralData.patientDetails.name}</Text>
        <Text style={styles.text}>Phone Number: {referralData.patientDetails.phoneNumber}</Text>
        <Text style={styles.text}>Patient ID: {referralData.patientDetails.patientId}</Text>

        <Text style={[styles.section, styles.sectionTitle]}>Symptoms</Text>
        <Text style={styles.text}>{referralData.symptoms}</Text>

        <Text style={[styles.section, styles.sectionTitle]}>Risk Score</Text>
        <Text style={styles.text}>{referralData.riskScore}</Text>

        <Text style={[styles.section, styles.sectionTitle]}>Explanation</Text>
        <Text style={styles.text}>{referralData.explanation}</Text>

        <Text style={[styles.section, styles.sectionTitle]}>Worker Details</Text>
        <Text style={styles.text}>Name: {referralData.workerDetails.name}</Text>
        <Text style={styles.text}>Role: {referralData.workerDetails.role}</Text>

        <Text style={styles.footer}>{referralData.footer}</Text>
      </Page>
    </Document>
  );

  return 'PDF content will be here'; // Replace with actual PDF data
};
