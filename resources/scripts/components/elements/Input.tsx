import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

export interface Props {
    isLight?: boolean;
    hasError?: boolean;
}

const light = css<Props>`
    ${tw`bg-white border-neutral-200 text-neutral-800`};
    &:focus {
        border-color: #6c5cff;
        box-shadow: 0 0 0 3px rgba(108, 92, 255, 0.25);
    }

    &:disabled {
        ${tw`bg-neutral-100 border-neutral-200`};
    }
`;

const checkboxStyle = css<Props>`
    ${tw`cursor-pointer appearance-none inline-block align-middle select-none flex-shrink-0 w-4 h-4 rounded-sm`};
    border: 1.5px solid rgba(255, 255, 255, 0.20);
    background: rgba(255, 255, 255, 0.06);
    color-adjust: exact;
    background-origin: border-box;
    transition: all 75ms linear, box-shadow 25ms linear;

    &:checked {
        ${tw`border-transparent bg-no-repeat bg-center`};
        background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z'/%3e%3c/svg%3e");
        background-color: #6c5cff;
        background-size: 100% 100%;
    }

    &:focus {
        outline: none;
        border-color: #6c5cff;
        box-shadow: 0 0 0 3px rgba(108, 92, 255, 0.30);
    }
`;

const inputStyle = css<Props>`
    resize: none;
    ${tw`appearance-none outline-none w-full min-w-0`};
    ${tw`p-3 text-sm transition-all duration-250 ease-out`};
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.10);
    border-radius: 0.75rem;
    color: rgba(255, 255, 255, 0.90);

    &::placeholder {
        color: rgba(255, 255, 255, 0.30);
    }

    & + .input-help {
        ${tw`mt-1 text-xs`};
        ${(props) => (props.hasError ? tw`text-red-300` : tw`text-white/40`)};
    }

    &:required,
    &:invalid {
        box-shadow: none;
    }

    &:not(:disabled):not(:read-only):hover {
        border-color: rgba(255, 255, 255, 0.18);
    }

    &:not(:disabled):not(:read-only):focus {
        border-color: #00d4ff;
        background: rgba(255, 255, 255, 0.07);
        box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.20), 0 0 12px rgba(0, 212, 255, 0.12);
        ${(props) => props.hasError && `
            border-color: #ff7af6;
            box-shadow: 0 0 0 3px rgba(255, 122, 246, 0.20);
        `};
    }

    &:disabled {
        opacity: 0.50;
        cursor: not-allowed;
    }

    ${(props) => props.isLight && light};
    ${(props) => props.hasError && `
        border-color: rgba(255, 122, 246, 0.50);
        color: rgba(255, 255, 255, 0.90);
        &:hover:not(:disabled) {
            border-color: rgba(255, 122, 246, 0.70);
        }
    `};
`;

const Input = styled.input<Props>`
    &:not([type='checkbox']):not([type='radio']) {
        ${inputStyle};
    }

    &[type='checkbox'],
    &[type='radio'] {
        ${checkboxStyle};

        &[type='radio'] {
            ${tw`rounded-full`};
        }
    }
`;
const Textarea = styled.textarea<Props>`
    ${inputStyle}
`;

export { Textarea };
export default Input;
