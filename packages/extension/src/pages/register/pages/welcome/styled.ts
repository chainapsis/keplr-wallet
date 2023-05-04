import styled from "styled-components";

export const Styles = {
  Container: styled.div`
    height: 100vh;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    overflow: scroll;

    padding: 6.25rem 10rem;

    @media screen and (max-height: 800px) {
      height: 100%;
    }
  `,
  ResponsiveContainer: styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 5rem;

    @media screen and (max-width: 1150px) {
      flex-direction: column;
      gap: 1rem;
    }
  `,
};
