// src/components/GoogleAd/styles.ts
import styled from 'styled-components';

export const AdContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;

  @media (max-width: 768px) {
    margin: 1.5rem auto;
    padding: 0 0.5rem;
  }

  ins.adsbygoogle {
    display: block;
    min-height: 90px;
  }
`;
