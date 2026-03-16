import React from 'react';
import FlashMessageRender from '@/components/FlashMessageRender';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import tw from 'twin.macro';
import styled from 'styled-components/macro';

type Props = Readonly<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        title?: string;
        borderColor?: string;
        showFlashes?: string | boolean;
        showLoadingOverlay?: boolean;
    }
>;

const GlassCard = styled.div`
    ${tw`rounded-3xl overflow-hidden relative`};
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35), 0 1px 4px rgba(0, 0, 0, 0.2);
`;

const ContentBox = ({ title, borderColor, showFlashes, showLoadingOverlay, children, ...props }: Props) => (
    <div {...props}>
        {title && (
            <h2 css={tw`text-white/80 mb-4 px-1 text-2xl font-semibold tracking-tight`}>{title}</h2>
        )}
        {showFlashes && (
            <FlashMessageRender byKey={typeof showFlashes === 'string' ? showFlashes : undefined} css={tw`mb-4`} />
        )}
        <GlassCard>
            <div css={tw`p-4 sm:p-6`}>
                <SpinnerOverlay visible={showLoadingOverlay || false} />
                {children}
            </div>
        </GlassCard>
    </div>
);

export default ContentBox;
