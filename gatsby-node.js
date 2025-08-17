/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require('path');
const _ = require('lodash');

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions;
  const postTemplate = path.resolve(`src/templates/post.js`);
  const projectTemplate = path.resolve(`src/templates/project.js`);
  const detailedProjectTemplate = path.resolve(`src/templates/detailed-project.js`);
  const tagTemplate = path.resolve('src/templates/tag.js');
  const pageTemplate = path.resolve(`src/templates/page.js`);

  const result = await graphql(`
    {
      postsRemark: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/posts/" } }
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              slug
            }
          }
        }
      }
      projectsRemark: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/projects/" } }
        sort: { order: DESC, fields: [frontmatter___date] }
        limit: 1000
      ) {
        edges {
          node {
            id
            fileAbsolutePath
            frontmatter {
              slug
              showInProjects
            }
          }
        }
      }
      tagsGroup: allMarkdownRemark(limit: 2000) {
        group(field: frontmatter___tags) {
          fieldValue
        }
      }
      pagesRemark: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/learn-embedded/" } }
      ) {
        edges {
          node {
            id
            frontmatter {
              title
            }
          }
        }
      }
    }
  `);

  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }

  // Create post detail pages
  const posts = result.data.postsRemark.edges;

  posts.forEach(({ node }) => {
    createPage({
      path: node.frontmatter.slug,
      component: postTemplate,
      context: {},
    });
  });

  // Create project detail pages
  const projects = result.data.projectsRemark.edges;

  console.log('Projects found:', projects.length);
  projects.forEach(({ node }, index) => {
    console.log(`Project ${index}:`, {
      slug: node.frontmatter.slug,
      frontmatter: node.frontmatter,
      filePath: node.fileAbsolutePath
    });
    
    if (node.frontmatter.slug) {
      // Determine if this should use the detailed project template
      const isDetailedProject = node.fileAbsolutePath.includes('/cubit/') || 
                               node.frontmatter.showInProjects === false;
      
      const templateToUse = isDetailedProject ? detailedProjectTemplate : projectTemplate;
      
      console.log(`Using ${isDetailedProject ? 'detailed' : 'standard'} template for:`, node.frontmatter.slug);
      
      createPage({
        path: node.frontmatter.slug,
        component: templateToUse,
        context: {
          slug: node.frontmatter.slug,
        },
      });
    } else {
      console.log('Skipping project with no slug:', node);
    }
  });

  // Extract tag data from query
  const tags = result.data.tagsGroup.group;
  // Make tag pages
  tags.forEach(tag => {
    createPage({
      path: `/pensieve/tags/${_.kebabCase(tag.fieldValue)}/`,
      component: tagTemplate,
      context: {
        tag: tag.fieldValue,
      },
    });
  });

  result.data.pagesRemark.edges.forEach(({ node }) => {
    createPage({
      path: '/learn-embedded',
      component: pageTemplate,
      context: { id: node.id },
    });
  });
};

// https://www.gatsbyjs.org/docs/node-apis/#onCreateWebpackConfig
exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  // https://www.gatsbyjs.org/docs/debugging-html-builds/#fixing-third-party-modules
  if (stage === 'build-html' || stage === 'develop-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /scrollreveal/,
            use: loaders.null(),
          },
          {
            test: /animejs/,
            use: loaders.null(),
          },
          {
            test: /miniraf/,
            use: loaders.null(),
          },
        ],
      },
    });
  }

  actions.setWebpackConfig({
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@config': path.resolve(__dirname, 'src/config'),
        '@fonts': path.resolve(__dirname, 'src/fonts'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@images': path.resolve(__dirname, 'src/images'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
    },
  });
};
