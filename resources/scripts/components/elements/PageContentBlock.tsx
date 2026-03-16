import React, { useEffect } from 'react';
import ContentContainer from '@/components/elements/ContentContainer';
import { motion } from 'framer-motion';
import tw from 'twin.macro';
import FlashMessageRender from '@/components/FlashMessageRender';

export interface PageContentBlockProps {
    title?: string;
    className?: string;
    showFlashKey?: string;
}

const PageContentBlock: React.FC<PageContentBlockProps> = ({ title, showFlashKey, className, children }) => {
    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [title]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
        >
            <ContentContainer css={tw`my-4 sm:my-10`} className={className}>
                {showFlashKey && <FlashMessageRender byKey={showFlashKey} css={tw`mb-4`} />}
                {children}
            </ContentContainer>
            <ContentContainer css={tw`mb-4`}>
                <p css={tw`text-center text-white/50 text-xs`}>
                    <a
                        rel={'noopener nofollow noreferrer'}
                        href={'https://chalixus.com'}
                        target={'_blank'}
                        css={tw`no-underline text-white/40 hover:text-white/70 transition-colors`}
                    >
                        Chalixus Software
                    </a>
                    &nbsp;&copy; 2015 - {new Date().getFullYear()}
                </p>
            </ContentContainer>
        </motion.div>
    );
};

export default PageContentBlock;
