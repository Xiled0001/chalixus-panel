import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';
import styled from 'styled-components/macro';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const CardContainer = styled.div`
    ${tw`rounded-3xl overflow-hidden`};
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35), 0 1px 4px rgba(0, 0, 0, 0.2);
`;

const CardHeader = styled.div`
    ${tw`p-3 flex items-center`};
    background: rgba(0, 0, 0, 0.25);
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    border-left: 3px solid rgba(108, 92, 255, 0.8);
`;

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <CardContainer className={className}>
        <CardHeader>
            {typeof title === 'string' ? (
                <p css={tw`text-xs uppercase tracking-widest font-semibold text-white/70`}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2 text-brand-primary opacity-80`} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </CardHeader>
        <div css={tw`p-4`}>{children}</div>
    </CardContainer>
);

export default memo(TitledGreyBox, isEqual);

