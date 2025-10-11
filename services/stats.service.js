const blogService = require('./blog.service');
const projectService = require('./project.service');
const skillService = require('./skill.service');
const contactService = require('./contact.service');

class StatsService {
  async getStats() {
    const blogs = await blogService.getBlogs();
    const projects = await projectService.getProjects();
    const skills = await skillService.getSkills();
    const contacts = await contactService.getContact();

    return {
      blogs: blogs.length,
      projects: projects.length,
      skills: skills.length,
      contacts: contacts.length,
    };
  }
}

module.exports = new StatsService();
