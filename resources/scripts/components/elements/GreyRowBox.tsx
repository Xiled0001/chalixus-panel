import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded-3xl no-underline text-white items-center p-4 overflow-hidden transition-all duration-250 ease-out`};
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35), 0 1px 4px rgba(0, 0, 0, 0.2);

    ${(props) =>
        props.$hoverable !== false &&
        `
        &:hover {
            transform: translateY(-4px);
            border-color: rgba(0, 212, 255, 0.30);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0, 212, 255, 0.20);
            background: rgba(255, 255, 255, 0.06);
        }
    `};

    & .icon {
        ${tw`rounded-2xl w-14 h-14 flex items-center justify-center flex-shrink-0`};
        background: rgba(108, 92, 255, 0.15);
        border: 1px solid rgba(108, 92, 255, 0.25);
        color: rgba(108, 92, 255, 0.9);
    }
`;
