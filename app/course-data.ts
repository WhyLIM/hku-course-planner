export type SessionKind = 'lecture' | 'practical' | 'tutorial' | 'exam' | 'consultation' | 'workshop' | 'revision';

export type Session = {
  date: string;
  start: string;
  end: string;
  title: string;
  venue?: string;
  teacher?: string;
  kind?: SessionKind;
  optional?: boolean;
};

export type Course = {
  code: string;
  title: string;
  semester: 1 | 2;
  color: string;
  coordinator: string;
  mode: string;
  venue: string;
  assessment?: string;
  note?: string;
  sessions: Session[];
};

const s = (date: string, start: string, end: string, title: string, venue = '', teacher = '', kind: SessionKind = 'lecture', optional = false): Session => ({ date, start, end, title, venue, teacher, kind, optional });

export const courses: Course[] = [
  {
    code: 'MSBS7101', title: 'Essential Skills in High-throughput Sequencing Data Analysis', semester: 1, color: '#0f766e',
    coordinator: 'Course teaching team', mode: 'Face-to-face / online consultation', venue: 'LT1 / LT2 / SR2-SR3, Faculty of Medicine Building',
    assessment: 'Examination: 8 Dec 2026, 18:30-20:30',
    sessions: [
      s('2026-09-01','18:30','20:30','Sequence database searches: BLAST, FASTA','LT2','Dr. HL Kwan'),
      s('2026-09-08','18:30','20:30','Genome browsing and annotations','SR2/SR3','Dr. HL Kwan'),
      s('2026-09-15','18:30','20:30','Introduction to using Linux','LT2','Dr. HL Kwan'),
      s('2026-09-22','18:30','20:30','Introduction to Genome Informatics','LT2','Dr. HL Kwan'),
      s('2026-09-29','18:30','20:30','NGS sequence alignment','SR2/SR3','Prof. Jason Wong'),
      s('2026-10-06','18:30','20:30','Variant calling and annotation 1','LT2','Prof. Jason Wong'),
      s('2026-10-20','18:30','20:30','Variant calling and annotation 2','LT2','Prof. Jason Wong'),
      s('2026-10-27','18:30','20:30','RNA sequencing analysis','LT2','Prof. Jason Wong'),
      s('2026-11-03','18:30','20:30','Genetic Disease Variant Analysis','SR2/SR3','BGI Team: Dr. Mingyan Fang'),
      s('2026-11-10','18:30','20:30','Genetic Disease Variant Interpretation','SR2/SR3','BGI Team: Dr. Mingyan Fang'),
      s('2026-11-17','18:30','20:30','Deep Learning for Gene Function Analysis','LT2','BGI Team: Dr. Zheng Su'),
      s('2026-11-24','18:30','20:30','AI Agents for Genetic Variant Analysis','SR2/SR3','BGI Team: Dr. Zheng Su'),
      s('2026-12-01','18:30','22:30','Consultation: Online Consultation','Online','Prof. Jason Wong','consultation'),
      s('2026-12-08','18:30','20:30','Examination','','','exam'),
    ],
  },
  {
    code: 'MSBS7102', title: 'Foundations in Biomedical Data Science', semester: 1, color: '#2563eb',
    coordinator: 'Prof. Yuanhua Huang', mode: 'Face-to-face / online', venue: 'LT2, HKJC-S1A/S1B, LT3/LT4, 3SR rooms and SR2/SR3',
    assessment: 'Examination: 11 Dec 2026, 18:30-20:30', note: 'The 30 Oct lecture title is blank in the source timetable.',
    sessions: [
      s('2026-09-04','18:30','20:30','Course Introduction and Statistical learning','LT2','Prof. Yuanhua Huang'),
      s('2026-09-11','18:30','20:30','Statistical machine learning','LT2','Prof. Yuanhua Huang'),
      s('2026-09-18','18:30','20:30','Statistical machine learning','LT2','Prof. Yuanhua Huang / Dr. Ray Hsu'),
      s('2026-09-25','18:30','20:30','Linear model in Virtual Cell Challenge (recording + self reading)','Online','Prof. Yuanhua Huang'),
      s('2026-10-02','18:30','20:30','Programming: basics to advance (1)','LT2','Dr. Ray Hsu'),
      s('2026-10-09','18:30','20:30','Programming: basics to advance (2)','HKJC-S1A & S1B','Dr. Ray Hsu'),
      s('2026-10-23','18:30','20:30','Programming: basics to advance (3)','HKJC-S1A & S1B','Dr. Ray Hsu'),
      s('2026-10-30','18:30','20:30','Topic not listed in source','LT3 & LT4','BGI Team: Dr. Yan Li'),
      s('2026-11-06','18:30','20:30','Genome sequencing applications','HKJC-S1A & S1B','BGI Team: Dr. Yan Li'),
      s('2026-11-13','18:30','20:30','Genetic disease analysis (congenital, rare diseases & GWAS)','3SR5','BGI Team: Dr. Yan Li'),
      s('2026-11-20','18:30','20:30','Non-invasive cell-free DNA analysis','3SR5','BGI Team: Dr. Yan Li'),
      s('2026-11-27','18:30','20:30','Multi-omics & single-cell/spatial analysis: metabolomics, transcriptome, regulome','3SR2 & 3SR3','BGI Team: Dr. Yan Li / Prof. Yuanhua Huang'),
      s('2026-12-04','18:30','22:30','Revision and Q&A','SR2 & SR3','Prof. Yuanhua Huang','tutorial'),
      s('2026-12-11','18:30','20:30','Examination','','Prof. Yuanhua Huang','exam'),
    ],
  },
  {
    code: 'MSPH7901', title: 'Introduction to Biostatistics', semester: 1, color: '#7c3aed',
    coordinator: 'Prof. Sheikh Taslim Ali · alist15@hku.hk', mode: 'Face-to-face', venue: 'LT3&4, 3SR-LT1, LT1, LT2, QTLT and examination rooms',
    assessment: 'Assignments 25% · Mid-term 25% · Final examination 50%', note: 'Red entries in the source are alternative practical/tutorial class times; select the assigned class only.',
    sessions: [
      s('2026-09-05','08:30','10:30','Exploratory data analysis','LT3&4','Prof. ST Ali'),
      s('2026-09-12','08:30','10:30','Correlation and regression','LT3&4','Prof. ST Ali'),
      s('2026-09-14','16:30','18:30','Practical 1','LT3&4','Tutors','practical',true),
      s('2026-09-16','13:00','15:00','Practical 1','LT1','Tutors','practical',true),
      s('2026-09-17','18:30','20:30','Practical 1','LT3&4','Tutors','practical',true),
      s('2026-09-19','08:30','10:30','Probability','LT3&4','Prof. ST Ali'),
      s('2026-10-10','08:30','10:30','Statistical inference','LT3&4','Prof. ST Ali'),
      s('2026-10-17','08:30','10:30','Hypothesis tests','LT3&4','Prof. ST Ali'),
      s('2026-10-21','18:30','20:30','Practical 2','LT3&4','Tutors','practical',true),
      s('2026-10-22','11:00','13:00','Practical 2','LT2','Tutors','practical',true),
      s('2026-10-23','18:30','20:30','Practical 2','QTLT','Tutors','practical',true),
      s('2026-10-24','09:30','11:30','Mid-term Examination','HKJC-S1-3 / 3SR-SR4 & SR5','Tutors','exam'),
      s('2026-11-07','08:30','10:30','Designing studies','LT3&4','Prof. ST Ali'),
      s('2026-11-09','16:30','18:30','Practical 3','3SR-LT1','Tutors','practical',true),
      s('2026-11-11','11:00','13:00','Practical 3','LT1','Tutors','practical',true),
      s('2026-11-12','18:30','20:30','Practical 3','QTLT','Tutors','practical',true),
      s('2026-11-14','08:30','10:30','Applied regression','LT3&4','Prof. ST Ali'),
      s('2026-11-16','16:00','18:00','Practical 4','3SR-LT1','Tutors','practical',true),
      s('2026-11-16','18:30','20:30','Practical 4','QTLT','Tutors','practical',true),
      s('2026-11-19','11:00','13:00','Practical 4','LT1','Tutors','practical',true),
      s('2026-11-21','08:30','10:30','Analysis of survival data','LT3&4','Prof. ST Ali'),
      s('2026-12-05','08:30','10:30','Statistics in practice','LT3&4','Prof. ST Ali'),
      s('2026-12-07','16:30','18:30','Tutorial','3SR-LT1','Tutors','tutorial',true),
      s('2026-12-09','18:30','20:30','Tutorial','LT1','Tutors','tutorial',true),
      s('2026-12-12','09:30','11:30','Final Examination','TBC','Tutors','exam'),
    ],
  },
  {
    code: 'PAED7902', title: 'Introduction to Genomic Medicine and Precision Health', semester: 1, color: '#db2777',
    coordinator: 'Prof. Yang Wanling · yangwl@hku.hk', mode: 'Face-to-face', venue: 'William MW Mong Block and No. 3 Sassoon Road venues',
    assessment: 'Final examination: 19 Dec 2026, 14:00-16:00 · Venue TBC, HKU Main Campus', note: 'Four reading assignments and accompanying journal clubs are organised throughout the course.',
    sessions: [
      s('2026-09-05','14:00','16:00','Defining Precision Medicine in 2026','LT2','Prof. W. Yang'),
      s('2026-09-12','14:00','16:00','Genomics, Proteomics, and Beyond','LT2','Prof. W. Yang'),
      s('2026-09-19','14:00','16:00','The Role of Big Data & Artificial Intelligence','LT2','Prof. W. Yang'),
      s('2026-10-03','14:00','16:00','Precision Oncology','LT2','Prof. W. Yang'),
      s('2026-10-10','14:00','16:00','Cardiovascular, Neurological & Rare Diseases','LT2','Prof. W. Yang'),
      s('2026-10-17','14:00','16:00','Pharmacogenomics','LT1, No. 3 Sassoon Road','Prof. W. Yang'),
      s('2026-10-31','14:00','16:00','Infectious Disease and Vaccine Personalization','LT1, No. 3 Sassoon Road','Prof. W. Yang'),
      s('2026-11-07','14:00','16:00','Electronic Health Records & Data Integration','LT2','Prof. W. Yang'),
      s('2026-11-14','14:00','16:00','Telemedicine, AI & Remote Genomics','Seminar Room 4, Room 403','Prof. W. Yang'),
      s('2026-11-21','14:00','16:00','Ethical, Economic, & Social Issues in Precision Medicine','LT1, William MW Mong Block','Prof. W. Yang'),
      s('2026-12-19','14:00','16:00','Final Examination','TBC, HKU Main Campus','','exam'),
    ],
  },
  {
    code: 'PATH7904', title: 'Fundamentals of Common Human Diseases', semester: 1, color: '#ea580c',
    coordinator: 'Prof. PPC Ip · philipip@pathology.hku.hk', mode: 'Face-to-face', venue: 'Room 06-035, 6/F, Block T, Queen Mary Hospital',
    assessment: 'Final examination: 17 Dec 2026, 09:30-11:30 · Venue TBC, HKU Main Campus', note: 'Includes a 2-hour e-learning activity on objectives, essay topic selection and assignment instructions.',
    sessions: [
      s('2026-09-03','18:30','20:30','Cervical Cancer · Abnormal uterine bleeding','Room 06-035, QMH','Dr. RWC Wong · Prof. JJX Li'),
      s('2026-09-10','18:30','20:30','Introduction to immunology · Global burden of disease','Room 06-035, QMH','Dr. RWK Ip · Prof. RSL Au Yeung'),
      s('2026-09-17','18:30','20:30','Breast diseases · Biomarkers for cancer therapy','Room 06-035, QMH','Prof. US Khoo · Prof. PPC Ip'),
      s('2026-09-24','18:30','20:30','Toxicology in practice','Room 06-035, QMH','Dr. MHL Tai'),
      s('2026-10-08','18:30','20:30','Osteoporosis · Cancer screening in Hong Kong','Room 06-035, QMH','Prof. CL Cheung · Dr. JWH Tsang'),
      s('2026-10-15','18:30','20:30','Pathology of male genital tract · Common urinary diseases','Room 06-035, QMH','Prof. Annie NY Cheung · Prof. CF Yeung'),
      s('2026-10-22','18:30','20:30','Respiratory tract diseases · Cardiovascular disorders','Room 06-035, QMH','Dr. J Lok · Prof. JM Nicholls'),
      s('2026-10-29','18:30','20:30','Liver diseases · Gastrointestinal diseases','Room 06-035, QMH','Prof. IOL Ng · Prof. RCL Lo'),
      s('2026-11-05','18:30','20:30','Thyroid goitres · Vascular central nervous diseases and dementia','Room 06-035, QMH','Prof. MMH Fung · Prof. SY Leung'),
      s('2026-11-12','18:30','20:30','Anaemia – What, Why and How?','Room 06-035, QMH','Prof. CF Sin'),
      s('2026-12-17','09:30','11:30','Final Examination','TBC, HKU Main Campus','','exam'),
    ],
  },
  {
    code: 'PAED7101', title: 'Molecular Diagnosis of Mendelian Diseases by NGS Technology', semester: 2, color: '#0891b2',
    coordinator: 'Prof. Wanling Yang · yangwl@hku.hk', mode: 'Face-to-face', venue: 'Departmental Seminar Room, 1/F, New Clinical Building, QMH / TBC', assessment: 'Final examination listed as TBC in the course header; timetable places it on 5 May 2027.',
    sessions: [
      s('2027-01-20','18:30','20:30','Principles of Mendelian Diseases and Clinical Phenotyping','','Prof. W. Yang'),
      s('2027-01-27','18:30','20:30','NGS Technologies for Molecular Diagnosis: Gene Panels, Exomes, and Genomes','','Prof. W. Yang'),
      s('2027-02-03','18:30','20:30','NGS Bioinformatics Pipeline: From Sequencing Reads to Variants','','Prof. W. Yang'),
      s('2027-02-17','18:30','20:30','Variant Annotation and ACMG-Based Variant Interpretation','','Prof. W. Yang'),
      s('2027-02-24','18:30','20:30','Journal Club','Zoom','Prof. W. Yang'),
      s('2027-03-03','18:30','20:30','Phenotype-Driven Variant Prioritization and Disease Gene Discovery','','Prof. W. Yang'),
      s('2027-03-17','18:30','20:30','Workshop','','Prof. W. Yang','workshop'),
      s('2027-03-24','18:30','20:30','Structural Variants, CNVs, Repeat Expansions, and Long-Read Genomics','','Prof. W. Yang'),
      s('2027-03-31','18:30','20:30','Clinical Reporting, Genetic Counseling, and Future Directions in Rare Disease Genomics','','Prof. W. Yang'),
      s('2027-04-07','18:30','20:30','Workshop','','Prof. W. Yang','workshop'),
      s('2027-04-14','18:30','20:30','Revision','','Prof. W. Yang','revision'),
      s('2027-05-05','18:30','20:30','Final Exam','','Prof. W. Yang','exam'),
    ],
  },
  {
    code: 'PAED7102', title: 'Genetic Studies of Complex Diseases', semester: 2, color: '#4f46e5',
    coordinator: 'Prof. Wanling Yang · yangwl@hku.hk', mode: 'Face-to-face', venue: 'Departmental Seminar Room, 1/F, New Clinical Building, QMH / TBC', assessment: 'Final examination listed as TBC in the course header; timetable places it on 7 May 2027.',
    sessions: [
      s('2027-01-22','18:30','20:30','Genetic Architecture of Complex Diseases: Heritability, Polygenicity, and Population Risk','','Prof. W. Yang'),
      s('2027-01-29','18:30','20:30','Principles of Population Genetics for Human Disease Studies','','Prof. W. Yang'),
      s('2027-02-19','18:30','20:30','Study Design in Human Genetics: Cohorts, Case-Control Studies, and Biobanks','','Prof. W. Yang'),
      s('2027-02-26','18:30','20:30','Genome-Wide Association Studies (GWAS): Methods, Quality Control, and Statistical Analysis','','Prof. W. Yang'),
      s('2027-03-05','18:30','20:30','Journal Club','Zoom','Prof. W. Yang'),
      s('2027-03-19','18:30','20:30','Post-GWAS Analysis: Fine Mapping, Functional Annotation, and Causal Variant Identification','','Prof. W. Yang'),
      s('2027-04-02','18:30','20:30','Workshop','','Prof. W. Yang','workshop'),
      s('2027-04-09','18:30','20:30','Polygenic Risk Scores and Genetic Prediction of Complex Diseases','','Prof. W. Yang'),
      s('2027-04-16','18:30','20:30','From Association to Mechanism: Integrative Genomics, Precision Medicine, and Future Directions','','Prof. W. Yang'),
      s('2027-04-23','18:30','20:30','Workshop','','Prof. W. Yang','workshop'),
      s('2027-04-30','18:30','20:30','Revision','','Prof. W. Yang','revision'),
      s('2027-05-07','18:30','20:30','Final Exam','','Prof. W. Yang','exam'),
    ],
  },
  {
    code: 'PAED7103', title: 'Cancer Genomics and Precision Treatment', semester: 2, color: '#be123c',
    coordinator: 'Prof. David Shih & Prof. Wanling Yang · yangwl@hku.hk', mode: 'Face-to-face', venue: 'Departmental Seminar Room, 1/F, New Clinical Building, QMH / TBC', assessment: 'Final examination listed as TBC in the course header; timetable places it on 8 May 2027.',
    sessions: [
      s('2027-01-23','13:00','15:00','Molecular Basis of Cancer: Somatic Mutations, Clonal Evolution, and Tumor Heterogeneity','','Prof. D. Shih'),
      s('2027-01-30','13:00','15:00','Cancer Genomics Technologies: NGS, Whole-Genome, Whole-Exome, and Single-Cell Sequencing','','Prof. D. Shih'),
      s('2027-02-13','13:00','15:00','Identification and Interpretation of Cancer Driver Genes and Genomic Alterations','','Prof. D. Shih'),
      s('2027-02-20','13:00','15:00','Computational Analysis of Cancer Genomic Data and Biomarker Discovery','','Prof. D. Shih'),
      s('2027-02-27','13:00','15:00','Journal Club','Zoom','Prof. W. Yang'),
      s('2027-03-06','13:00','15:00','Precision Oncology: Targeted Therapies, Immunogenomics, and Treatment Stratification','','Prof. D. Shih'),
      s('2027-03-20','13:00','15:00','Workshop','','Prof. W. Yang','workshop'),
      s('2027-04-03','13:00','15:00','Translational Cancer Genomics: Clinical Implementation, Liquid Biopsy, and Future Directions','','Prof. D. Shih'),
      s('2027-04-10','13:00','15:00','Journal Club','Zoom','Prof. W. Yang'),
      s('2027-04-17','13:00','15:00','Workshop','','Prof. W. Yang','workshop'),
      s('2027-04-24','13:00','15:00','Revision','','Prof. W. Yang','revision'),
      s('2027-05-08','13:00','15:00','Final Exam','','Prof. W. Yang','exam'),
    ],
  },
  {
    code: 'PAED7104', title: 'Scientific Methods, Experimental Design, and Data Interpretation in Genetics and Genomics', semester: 2, color: '#65a30d',
    coordinator: 'Prof. Wanling Yang · yangwl@hku.hk', mode: 'Face-to-face', venue: 'Departmental Seminar Room, 1/F, New Clinical Building, QMH / TBC', assessment: 'Final examination listed as TBC in the course header; timetable places it on 8 May 2027.',
    sessions: [
      s('2027-01-23','15:30','17:30','Scientific Thinking in Genetics and Genomics: Hypotheses, Evidence, and Causal Inference','','Prof. W. Yang'),
      s('2027-01-30','15:30','17:30','Experimental Design Principles: Controls, Randomization, Replication, and Bias','','Prof. W. Yang'),
      s('2027-02-13','15:30','17:30','Genetic and Genomic Study Designs: Family Studies, Cohorts, Case-Control Studies, and Population-Based Approaches','','Prof. W. Yang'),
      s('2027-02-20','15:30','17:30','Data Analysis and Statistical Reasoning: From Association to Interpretation','','Prof. W. Yang'),
      s('2027-02-27','15:30','17:30','Journal Club','Zoom','Prof. W. Yang'),
      s('2027-03-06','15:30','17:30','Critical Evaluation of Scientific Literature: Reading, Reviewing, and Reproducibility','','Prof. W. Yang'),
      s('2027-03-20','15:30','17:30','Workshop','','Prof. W. Yang','workshop'),
      s('2027-04-03','15:30','17:30','From Data to Discovery: Integrating Evidence, Drawing Conclusions, and Communicating Findings','','Prof. W. Yang'),
      s('2027-04-10','15:30','17:30','Journal Club','Zoom','Prof. W. Yang'),
      s('2027-04-17','15:30','17:30','Workshop','','Prof. W. Yang','workshop'),
      s('2027-04-24','15:30','17:30','Revision','','Prof. W. Yang','revision'),
      s('2027-05-08','15:30','17:30','Final Exam','','Prof. W. Yang','exam'),
    ],
  },
];
