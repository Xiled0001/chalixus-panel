import React from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';

interface Props {
    isLoading?: boolean;
    size?: 'xsmall' | 'small' | 'large' | 'xlarge';
    color?: 'green' | 'red' | 'primary' | 'grey';
    isSecondary?: boolean;
}

// ─── Base style shared by all variants ───────────────────────────────────────
const ButtonBase = css`
    ${tw`relative inline-flex items-center justify-center font-semibold tracking-wide text-sm transition-all duration-200 select-none`};
    border-radius: 0.875rem;
    border: 1px solid transparent;

    &:disabled {
        opacity: 0.45;
        cursor: default;
        transform: none !important;
        box-shadow: none !important;
    }

    &:not(:disabled):active {
        transform: scale(0.95) !important;
    }
`;

// ─── Color variants ───────────────────────────────────────────────────────────
const primaryStyle = css<Props>`
    ${(props) =>
        !props.isSecondary &&
        css`
            background: linear-gradient(135deg, #6c5cff 0%, #00d4ff 100%);
            color: #ffffff;
            border-color: transparent;
            box-shadow: 0 2px 12px rgba(108, 92, 255, 0.3);

            &:hover:not(:disabled) {
                transform: scale(1.04) translateY(-1px);
                box-shadow: 0 0 24px rgba(108, 92, 255, 0.65), 0 0 12px rgba(0, 212, 255, 0.4);
                background: linear-gradient(135deg, #7d6fff 0%, #33ddff 100%);
            }
        `};
`;

const greyStyle = css`
    background: rgba(255, 255, 255, 0.07);
    color: rgba(255, 255, 255, 0.85);
    border-color: rgba(255, 255, 255, 0.12);

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.11);
        border-color: rgba(255, 255, 255, 0.20);
        transform: scale(1.03);
    }
`;

const greenStyle = css`
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: #ffffff;
    border-color: transparent;
    box-shadow: 0 2px 10px rgba(34, 197, 94, 0.25);

    &:hover:not(:disabled) {
        transform: scale(1.04) translateY(-1px);
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
    }
`;

const redStyle = css`
    background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
    color: #ffffff;
    border-color: transparent;
    box-shadow: 0 2px 10px rgba(239, 68, 68, 0.25);

    &:hover:not(:disabled) {
        transform: scale(1.04) translateY(-1px);
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
    }
`;

const secondaryStyle = css<Props>`
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.8);
    border-color: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(8px);

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.20);
        color: #ffffff;
        transform: scale(1.03);

        ${(props) => props.color === 'red' && css`
            background: rgba(239, 68, 68, 0.15);
            border-color: rgba(239, 68, 68, 0.40);
            color: #fca5a5;
        `};
        ${(props) => props.color === 'primary' && css`
            background: rgba(108, 92, 255, 0.15);
            border-color: rgba(108, 92, 255, 0.40);
            color: #c4baff;
        `};
        ${(props) => props.color === 'green' && css`
            background: rgba(34, 197, 94, 0.15);
            border-color: rgba(34, 197, 94, 0.40);
            color: #86efac;
        `};
    }
`;

const ButtonStyle = styled.button<Omit<Props, 'isLoading'>>`
    ${ButtonBase};

    ${(props) => ((!props.isSecondary && !props.color) || props.color === 'primary') && primaryStyle};
    ${(props) => props.color === 'grey' && greyStyle};
    ${(props) => props.color === 'green' && greenStyle};
    ${(props) => props.color === 'red' && redStyle};
    ${(props) => props.isSecondary && secondaryStyle};

    ${(props) => props.size === 'xsmall' && tw`px-2 py-1 text-xs`};
    ${(props) => (!props.size || props.size === 'small') && tw`px-4 py-2`};
    ${(props) => props.size === 'large' && tw`px-5 py-3 text-sm`};
    ${(props) => props.size === 'xlarge' && tw`px-5 py-3 w-full`};
`;

type ComponentProps = Omit<JSX.IntrinsicElements['button'], 'ref' | keyof Props> & Props;

const Button: React.FC<ComponentProps> = ({ children, isLoading, ...props }) => (
    <ButtonStyle {...props}>
        {isLoading && (
            <div css={tw`flex absolute justify-center items-center w-full h-full left-0 top-0`}>
                <Spinner size={'small'} />
            </div>
        )}
        <span css={isLoading ? tw`text-transparent` : undefined}>{children}</span>
    </ButtonStyle>
);

type LinkProps = Omit<JSX.IntrinsicElements['a'], 'ref' | keyof Props> & Props;

const LinkButton: React.FC<LinkProps> = (props) => <ButtonStyle as={'a'} {...props} />;

export { LinkButton, ButtonStyle };
export default Button;
