import React from 'react';
import cvData from '../data/cv.json';

const About: React.FC = () => {
  return (
    <section id="about">
      <div className="container">
        <h2>Curriculum Vitae</h2>
        <div className="row">
          <div className="col-md-12">
            <p className="text-readable-shadow">{cvData.profile}</p>
            <p><em>{cvData.notice}</em></p>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <h4>Contact Details</h4>
            <ul className="list-unstyled">
              <li><strong>Name:</strong> {cvData.name}</li>
              <li><strong>Address:</strong> {cvData.contact.address}</li>
              <li><strong>Email:</strong> <a href={`mailto:${cvData.contact.email}`}>{cvData.contact.email}</a></li>
              <li><strong>LinkedIn:</strong> <a href={`https://${cvData.contact.linkedin}`} target="_blank" rel="noopener noreferrer">{cvData.contact.linkedin}</a></li>
              <li><strong>GitHub:</strong> <a href={`https://${cvData.contact.github}`} target="_blank" rel="noopener noreferrer">{cvData.contact.github}</a></li>
            </ul>
          </div>
          <div className="col-md-6">
            <h4>Experience</h4>
            <ul className="list-unstyled">
              {cvData.workExperience.map((job, index) => (
                <li key={index} style={{ marginBottom: '1rem' }}>
                  <strong>{job.role}</strong> | {job.company} | {job.period}
                  {Array.isArray(job.description) && job.description.length > 0 && (
                    <ul>
                      {job.description.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-md-6">
            <h4>Education</h4>
            <ul className="list-unstyled">
              {cvData.education.map((edu, index) => (
                <li key={index}>
                  <strong>{edu.year}: {edu.degree}</strong> - {edu.institution}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-6">
            <h4>Skills</h4>
            {Object.entries(cvData.skills).map(([category, skills]) => {
              const formattedCategory = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const html = `<strong>${formattedCategory}:</strong> ${skills}`;
              return <p key={category} dangerouslySetInnerHTML={{ __html: html }} />;
            })}
            <h4>Languages</h4>
            <ul className="list-unstyled">
              {cvData.languages.map((lang, index) => (
                <li key={index}><strong>{lang.language}:</strong> {lang.proficiency}</li>
              ))}
            </ul>
            <h4>Mobility</h4>
            <p>{cvData.transport}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
