# Library Resources Sheet Setup Guide

## Sheet Name: `LibraryResources`

This sheet stores e-books uploaded by librarians and resources (notes, research papers) uploaded by faculty members.

## Column Structure (A-R, 18 columns)

| Column | Field Name | Type | Description | Example |
|--------|------------|------|-------------|---------|
| A | resourceId | String | Unique identifier | RES-001 |
| B | type | String | Type of resource | ebook, resource |
| C | title | String | Title of the resource | Introduction to Algorithms |
| D | author | String | Author/Creator name | Thomas H. Cormen |
| E | category | String | Subject category | Computer Science, Mathematics, Physics |
| F | description | Text | Brief description | Comprehensive guide to algorithms |
| G | fileUrl | URL | Google Drive link | https://drive.google.com/file/d/... |
| H | fileName | String | Original file name | algorithms_intro.pdf |
| I | fileSize | Number | File size in bytes | 5242880 |
| J | fileType | String | File extension | PDF, DOCX, PPTX |
| K | uploadedBy | String | User ID of uploader | LIB-001 or FAC-CSE-001 |
| L | uploadedByName | String | Name of uploader | Dr. John Doe |
| M | uploadedByRole | String | Role of uploader | librarian, faculty |
| N | uploadDate | DateTime | Upload timestamp | 2025-12-08T10:30:00Z |
| O | tags | String | Comma-separated tags | algorithms,data-structures,textbook |
| P | downloadCount | Number | Number of downloads | 150 |
| Q | status | String | Resource status | active, archived |
| R | rowNumber | Number | Sheet row reference | 2 |

## Setup Instructions

### 1. Create the Sheet

1. Open your Google Sheet for the ERP system
2. Create a new sheet named **LibraryResources**
3. Add the header row with the following columns:

```
resourceId | type | title | author | category | description | fileUrl | fileName | fileSize | fileType | uploadedBy | uploadedByName | uploadedByRole | uploadDate | tags | downloadCount | status | rowNumber
```

### 2. Column Definitions

#### Type Field
- **ebook**: E-books uploaded by librarians
- **resource**: Notes, research papers uploaded by faculty

#### Category Field (Subject Categories)
Suggested categories:
- Computer Science
- Mathematics
- Physics
- Chemistry
- Biology
- Electronics
- Mechanical Engineering
- Civil Engineering
- Electrical Engineering
- Business Administration
- General Studies
- Other

#### File Type Field
Common file types:
- PDF (Portable Document Format)
- DOCX (Microsoft Word)
- PPTX (Microsoft PowerPoint)
- XLSX (Microsoft Excel)
- TXT (Text File)
- EPUB (E-book Format)

#### Status Field
- **active**: Resource is available for download
- **archived**: Resource is hidden from students

### 3. Data Validation (Optional)

Set up data validation for consistency:

1. **Type Column (B)**: List of values
   - ebook
   - resource

2. **Status Column (Q)**: List of values
   - active
   - archived

3. **uploadedByRole Column (M)**: List of values
   - librarian
   - faculty

### 4. Sample Data

Here's an example entry:

```
RES-001 | ebook | Introduction to Algorithms | Thomas H. Cormen | Computer Science | Comprehensive guide covering fundamental algorithms and data structures | https://drive.google.com/file/d/xxx | algorithms_intro.pdf | 5242880 | PDF | LIB-001 | John Smith | librarian | 2025-12-08T10:30:00Z | algorithms,data-structures,textbook | 150 | active | 2
```

```
RES-002 | resource | Machine Learning Notes | Dr. Jane Doe | Computer Science | Lecture notes for ML course covering supervised and unsupervised learning | https://drive.google.com/file/d/yyy | ml_notes_2024.pdf | 2097152 | PDF | FAC-CSE-001 | Dr. Jane Doe | faculty | 2025-12-08T11:00:00Z | machine-learning,ai,notes | 85 | active | 3
```

## Access Permissions

### Librarians Can:
- Upload e-books (type: ebook)
- View all resources
- Archive/unarchive any resource
- See download statistics

### Faculty Can:
- Upload resources (type: resource) - notes, research papers
- View all resources
- Edit/archive their own uploaded resources
- See download statistics for their resources

### Students Can:
- View all active resources
- Download resources
- Search and filter resources
- Cannot upload or edit

## File Upload Guidelines

### For Librarians (E-books):
- Upload textbooks, reference books, journals
- Ensure proper copyright permissions
- Recommended format: PDF
- Maximum file size: 50MB (configurable)

### For Faculty (Resources):
- Upload lecture notes, research papers, study materials
- Can upload presentations, documents, spreadsheets
- Recommended formats: PDF, DOCX, PPTX
- Maximum file size: 25MB (configurable)

## Search and Filter Features

Students can search/filter by:
- Resource type (e-books, resources)
- Category/Subject
- Author/Uploader name
- Tags
- File type

## Notes

1. **resourceId** should be auto-generated starting from RES-001
2. **downloadCount** increments each time a student downloads the resource
3. **rowNumber** is used for quick sheet updates
4. File URLs should be Google Drive shareable links with "anyone with the link can view" permission
5. Archive resources instead of deleting them to maintain records
6. Tags help students find related materials quickly
7. Regular backup of uploaded files is recommended

## Integration with Google Drive

1. Create a dedicated Google Drive folder: "Library Resources"
2. Create subfolders:
   - E-Books (for librarian uploads)
   - Faculty Resources (with subfolders per faculty)
3. Upload files to appropriate folders
4. Share with "anyone with link can view"
5. Copy the shareable link to the fileUrl column
