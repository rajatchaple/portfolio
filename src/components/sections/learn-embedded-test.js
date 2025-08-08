import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon } from '@components/icons';

const StyledSection = styled.section`
  max-width: 1000px;
  margin: 0 auto;
  padding: 100px 0;
`;

const StyledTitle = styled.h2`
  font-size: clamp(24px, 5vw, 28px);
  margin-bottom: 50px;
  text-align: center;
`;

const LearnEmbeddedEnhanced = () => {
    // Define topicCategories first
    const topicCategories = {
        'Hardware Fundamentals': {
            icon: '🔧',
            color: '#64ffda',
            topics: [
                {
                    id: 'memory-management',
                    title: 'Memory Management',
                    difficulty: 'beginner',
                    description: 'Memory layout, stack vs heap, and efficient memory usage.'
                }
            ]
        }
    };

    // Then use it in state initialization
    const [activeCategory, setActiveCategory] = useState('Hardware Fundamentals');
    const [activeTopic, setActiveTopic] = useState(topicCategories['Hardware Fundamentals'].topics[0]);

    return (
        <StyledSection id="learn">
            <StyledTitle>Learn Embedded Systems</StyledTitle>
            <div>
                <p>Interactive learning platform for embedded systems</p>
                <p>Active category: {activeCategory}</p>
                <p>Active topic: {activeTopic.title}</p>
                <button onClick={() => setActiveCategory('Hardware Fundamentals')}>
                    <Icon name="GitHub" /> Test Category
                </button>
            </div>
        </StyledSection>
    );
};

export default LearnEmbeddedEnhanced;
