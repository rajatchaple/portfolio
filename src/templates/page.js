import React from 'react';
import { graphql } from 'gatsby';

export default function PageTemplate({ data }) {
    const { frontmatter, html } = data.markdownRemark;
    return (
        <main>
            <h1>{frontmatter.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </main>
    );
}

export const pageQuery = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      frontmatter {
        title
      }
      html
    }
  }
`;