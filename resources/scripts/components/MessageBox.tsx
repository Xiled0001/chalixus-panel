import * as React from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';

export type FlashMessageType = 'success' | 'info' | 'warning' | 'error';

interface Props {
    title?: string;
    children: string;
    type?: FlashMessageType;
}

// Returns glass-tinted style per message type
const getContainerStyle = (type?: FlashMessageType): string => {
    switch (type) {
        case 'error':
            return `
                background: rgba(239, 68, 68, 0.12);
                border: 1px solid rgba(239, 68, 68, 0.30);
                border-left: 3px solid #ef4444;
            `;
        case 'info':
            return `
                background: rgba(108, 92, 255, 0.12);
                border: 1px solid rgba(108, 92, 255, 0.30);
                border-left: 3px solid #6c5cff;
            `;
        case 'success':
            return `
                background: rgba(34, 197, 94, 0.12);
                border: 1px solid rgba(34, 197, 94, 0.30);
                border-left: 3px solid #22c55e;
            `;
        case 'warning':
            return `
                background: rgba(234, 179, 8, 0.12);
                border: 1px solid rgba(234, 179, 8, 0.30);
                border-left: 3px solid #eab308;
            `;
        default:
            return `
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.10);
            `;
    }
};

const getBadgeStyle = (type?: FlashMessageType): string => {
    switch (type) {
        case 'error':   return `background: rgba(239, 68, 68, 0.25); color: #fca5a5;`;
        case 'info':    return `background: rgba(108, 92, 255, 0.25); color: #c4baff;`;
        case 'success': return `background: rgba(34, 197, 94, 0.25); color: #86efac;`;
        case 'warning': return `background: rgba(234, 179, 8, 0.25); color: #fde047;`;
        default:        return `background: rgba(255, 255, 255, 0.10); color: rgba(255,255,255,0.7);`;
    }
};

const Container = styled.div<{ $type?: FlashMessageType }>`
    ${tw`p-3 items-center leading-normal rounded-2xl flex w-full text-sm text-white`};
    backdrop-filter: blur(8px);
    ${(props) => getContainerStyle(props.$type)};
`;
Container.displayName = 'MessageBox.Container';

const MessageBox = ({ title, children, type }: Props) => (
    <Container css={tw`lg:inline-flex`} $type={type} role={'alert'}>
        {title && (
            <span
                className={'title'}
                css={tw`flex rounded-xl uppercase px-2 py-1 text-xs font-bold mr-3 leading-none whitespace-nowrap`}
                style={{ ...(type ? { cssText: getBadgeStyle(type) } : {}) } as React.CSSProperties}
            >
                {title}
            </span>
        )}
        <span css={tw`mr-2 text-left flex-auto text-white/80`}>{children}</span>
    </Container>
);
MessageBox.displayName = 'MessageBox';

export default MessageBox;
