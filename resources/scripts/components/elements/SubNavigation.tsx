import styled from 'styled-components/macro';
import tw from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full overflow-x-auto`};
    background: rgba(11, 15, 26, 0.80);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);

    & > div {
        ${tw`flex items-center text-sm mx-auto px-4`};
        max-width: 1200px;

        & > a,
        & > div {
            ${tw`inline-flex items-center py-3 px-4 no-underline whitespace-nowrap transition-all duration-250 ease-out`};
            color: rgba(255, 255, 255, 0.50);
            border-radius: 0.625rem;
            margin: 0.375rem 0.125rem;
            font-weight: 500;
            font-size: 0.8125rem;
            letter-spacing: 0.01em;

            &:not(:first-of-type) {
                ${tw`ml-1`};
            }

            &:hover {
                color: rgba(255, 255, 255, 0.85);
                background: rgba(255, 255, 255, 0.06);
            }

            &:active,
            &.active {
                color: #ffffff;
                background: rgba(108, 92, 255, 0.20);
                box-shadow: 0 0 12px rgba(108, 92, 255, 0.20), inset 0 0 0 1px rgba(108, 92, 255, 0.30);
            }
        }
    }
`;

export default SubNavigation;
