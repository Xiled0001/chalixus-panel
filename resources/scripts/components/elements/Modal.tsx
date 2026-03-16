import React, { useEffect, useMemo, useRef, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import tw from 'twin.macro';
import styled, { css } from 'styled-components/macro';
import { breakpoint } from '@/theme';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export interface RequiredModalProps {
    visible: boolean;
    onDismissed: () => void;
    appear?: boolean;
    top?: boolean;
}

export interface ModalProps extends RequiredModalProps {
    dismissable?: boolean;
    closeOnEscape?: boolean;
    closeOnBackground?: boolean;
    showSpinnerOverlay?: boolean;
}

export const ModalMask = styled(motion.div)`
    ${tw`fixed z-50 overflow-auto flex w-full inset-0`};
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
`;

const ModalContainer = styled(motion.div)<{ alignTop?: boolean }>`
    max-width: 95%;
    max-height: calc(100vh - 8rem);
    ${breakpoint('md')`max-width: 75%`};
    ${breakpoint('lg')`max-width: 50%`};

    ${tw`relative flex flex-col w-full m-auto`};
    ${(props) =>
        props.alignTop &&
        css`
            margin-top: 20%;
            ${breakpoint('md')`margin-top: 10%`};
        `};

    margin-bottom: auto;

    & > .close-icon {
        ${tw`absolute right-0 p-2 text-white cursor-pointer opacity-50 transition-all duration-250 ease-out hover:opacity-100`};
        top: -2.5rem;

        &:hover {
            ${tw`transform rotate-90 scale-105`}
        }

        & > svg {
            ${tw`w-6 h-6`};
        }
    }
`;

const Modal: React.FC<ModalProps> = ({
    visible,
    appear,
    dismissable,
    showSpinnerOverlay,
    top = true,
    closeOnBackground = true,
    closeOnEscape = true,
    onDismissed,
    children,
}) => {
    const [render, setRender] = useState(visible);

    const isDismissable = useMemo(() => {
        return (dismissable || true) && !(showSpinnerOverlay || false);
    }, [dismissable, showSpinnerOverlay]);

    useEffect(() => {
        if (!isDismissable || !closeOnEscape) return;

        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setRender(false);
        };

        window.addEventListener('keydown', handler);
        return () => {
            window.removeEventListener('keydown', handler);
        };
    }, [isDismissable, closeOnEscape, render]);

    useEffect(() => setRender(visible), [visible]);

    return (
        <AnimatePresence onExitComplete={onDismissed}>
            {render && (
            <ModalMask
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                onContextMenu={(e) => e.stopPropagation()}
                onMouseDown={(e) => {
                    if (isDismissable && closeOnBackground) {
                        e.stopPropagation();
                        if (e.target === e.currentTarget) {
                            setRender(false);
                        }
                    }
                }}
            >
                <ModalContainer
                    alignTop={top}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 0.25 }}
                >
                    {isDismissable && (
                        <div className={'close-icon'} onClick={() => setRender(false)}>
                            <svg
                                xmlns={'http://www.w3.org/2000/svg'}
                                fill={'none'}
                                viewBox={'0 0 24 24'}
                                stroke={'currentColor'}
                            >
                                <path
                                    strokeLinecap={'round'}
                                    strokeLinejoin={'round'}
                                    strokeWidth={'2'}
                                    d={'M6 18L18 6M6 6l12 12'}
                                />
                            </svg>
                        </div>
                    )}
                    <AnimatePresence>
                        {showSpinnerOverlay && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                css={tw`absolute w-full h-full rounded-3xl flex items-center justify-center`}
                                style={{ background: 'rgba(11, 15, 26, 0.7)', backdropFilter: 'blur(4px)', zIndex: 9999 }}
                            >
                                <Spinner />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.10)',
                            borderRadius: '1.5rem',
                            boxShadow: '0 8px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(108,92,255,0.08)',
                            overflowY: 'scroll',
                        }}
                        css={tw`p-4 sm:p-6 md:p-8 transition-all duration-200`}
                    >
                        {children}
                    </div>
                </ModalContainer>
            </ModalMask>
            )}
        </AnimatePresence>
    );
};

const PortaledModal: React.FC<ModalProps> = ({ children, ...props }) => {
    const element = useRef(document.getElementById('modal-portal'));

    return createPortal(<Modal {...props}>{children}</Modal>, element.current!);
};

export default PortaledModal;
