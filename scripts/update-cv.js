
const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '..', 'CV', 'cv.md');
const jsonPath = path.join(__dirname, '..', 'src', 'data', 'cv.json');

// Helper function to extract a section from the markdown
function getSection(text, startHeading) {
    const start = text.indexOf(startHeading);
    if (start === -1) return '';
    const nextHeadingIndex = text.indexOf('\n###', start + startHeading.length);
    const nextRuleIndex = text.indexOf('\n---', start + startHeading.length);
    let end = text.length;
    if (nextHeadingIndex !== -1 && nextRuleIndex !== -1) {
        end = Math.min(nextHeadingIndex, nextRuleIndex);
    } else if (nextHeadingIndex !== -1) {
        end = nextHeadingIndex;
    } else if (nextRuleIndex !== -1) {
        end = nextRuleIndex;
    }
    return text.substring(start + startHeading.length, end).trim();
}

// Helper to clean up markdown formatting from a line
const cleanLine = (line) => {
    if (!line) return "";
    return line
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Convert [text](url) to text
        .replace(/\*\*(.*?)\*\*/g, '$1')    // remove bold
        .replace(/[#*_>]/g, '')            // remove markdown characters #, *, _, >
        .replace(/\s\s+/g, ' ')            // collapse multiple spaces
        .trim();
};

// Main parsing function
function parseCvMarkdown(md) {
    const cv = {};

    // --- Contact Info ---
    const contactSection = md.split('---')[1].trim();
    const contactLines = contactSection.split('\n').filter(line => line.trim() !== '');
    cv.name = cleanLine(contactLines[0]);
    const detailsLine = contactLines[1];
    const addressMatch = detailsLine.match(/^([^|]+)/);
    const emailMatch = detailsLine.match(/\[(.*?@.*?)\]/);
    const linkedinMatch = detailsLine.match(/\[(linkedin.com.*?)\]/);
    const githubMatch = detailsLine.match(/\[(github.com.*?)\]/);
    cv.contact = {
        address: addressMatch ? addressMatch[1].trim() : '',
        email: emailMatch ? emailMatch[1].trim() : '',
        linkedin: linkedinMatch ? linkedinMatch[1].trim() : '',
        github: githubMatch ? githubMatch[1].trim() : '',
    };

    // --- Profile & Notice ---
    const profileSection = getSection(md, '### **Profiel**') || getSection(md, '### **Profile**');
    let profileParts = profileSection.split('Komt in aanmerking');
    if (profileParts.length > 1) {
        cv.profile = cleanLine(profileParts[0]);
        cv.notice = cleanLine('Komt in aanmerking' + profileParts[1]);
    } else {
        profileParts = profileSection.split('Eligible for employer');
        if (profileParts.length > 1) {
            cv.profile = cleanLine(profileParts[0]);
            cv.notice = cleanLine('Eligible for employer' + profileParts[1]);
        } else {
            cv.profile = cleanLine(profileSection);
            cv.notice = '';
        }
    }


    // --- Work Experience ---
    const expSection = getSection(md, '### **Werkervaring**') || getSection(md, '### **Work Experience**');
    cv.workExperience = [];
    const lines = expSection.split('\n');
    let currentJob = null;

    lines.forEach(line => {
        const cleaned = cleanLine(line);
        if (line.includes('|')) {
            // This is a title line, save the previous job and start a new one
            if (currentJob) {
                cv.workExperience.push(currentJob);
            }

            const parts = line.split('|').map(p => cleanLine(p.replace(/\\-/g, '-')));
            let role = '', company = '', period = '';
            if (parts.length === 3) {
                [role, company, period] = parts;
            } else if (parts.length === 2) {
                [role, period] = parts;
                company = '';
            }
            currentJob = { role, company, period, description: '' };
        } else if (currentJob && cleaned) {
            // This is a description line for the current job
            currentJob.description = (currentJob.description + ' ' + cleaned).trim();
        }
    });

    // Add the last job
    if (currentJob) {
        cv.workExperience.push(currentJob);
    }

    // --- Skills ---
    const skillsSection = getSection(md, '### **Vaardigheden**') || getSection(md, '### **Skills**');
    cv.skills = {};
    const skillLines = skillsSection.split('\n').filter(line => line.includes(':'));
    skillLines.forEach(line => {
        const parts = line.split(':');
        const key = cleanLine(parts[0]).toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
        const values = cleanLine(parts.slice(1).join(':'));
        cv.skills[key] = values;
    });

    // --- Education ---
    const eduSection = getSection(md, '### **Opleidingen en Cursussen**') || getSection(md, '### **Education**');
    cv.education = [];
    const eduLines = eduSection.split('\n').filter(line => line.trim());
    eduLines.forEach(line => {
        const parts = cleanLine(line).split('|').map(s => s.trim());
        if (parts.length === 3) {
            cv.education.push({ degree: parts[0], institution: parts[1], year: parts[2] });
        } else if (parts.length === 2) {
            cv.education.push({ degree: parts[0], institution: "", year: parts[1] });
        } else if (parts.length === 1) {
            cv.education.push({ degree: parts[0], institution: "", year: "" });
        }
    });

    // --- Languages & Transport ---
    const langSection = getSection(md, '### **Talen & Vervoer**') || getSection(md, '### **Languages & Mobility**');
    cv.languages = [];
    const langLines = langSection.split('\n').filter(line => line.trim());
    langLines.forEach(line => {
        if (line.includes('Rijbewijs') || line.includes('Driving License')) {
            const parts = line.split(':');
            cv.transport = parts.length > 1 ? cleanLine(parts[1]) : '';
        } else if (line.includes(':')) {
            const parts = line.split(':');
            const language = cleanLine(parts[0]);
            const proficiency = parts.length > 1 ? cleanLine(parts[1]) : '';
            cv.languages.push({ language, proficiency });
        }
    });

    return cv;
}

try {
    console.log('Reading CV.md...');
    const markdownContent = fs.readFileSync(mdPath, 'utf8');
    console.log('Parsing markdown and converting to JSON...');
    const cvData = parseCvMarkdown(markdownContent);
    console.log(`Writing to ${jsonPath}...`);
    fs.writeFileSync(jsonPath, JSON.stringify(cvData, null, 2));
    console.log('Successfully updated cv.json!');
} catch (error) {
    console.error('Failed to update cv.json:', error);
    process.exit(1);
}
