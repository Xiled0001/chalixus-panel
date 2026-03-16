import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${breakpoint('sm')`
        ${tw`w-4/5 mx-auto`}
    `};

    ${breakpoint('md')`
        ${tw`p-10`}
    `};

    ${breakpoint('lg')`
        ${tw`w-3/5`}
    `};

    ${breakpoint('xl')`
        ${tw`w-full`}
        max-width: 600px;
    `};
`;

const GlassCard = styled.div`
    ${tw`w-full p-8 md:p-10 mx-1 flex flex-col md:flex-row items-center gap-8`};
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1.5rem;
    box-shadow: 0 12px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(108, 92, 255, 0.05);
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Container>
        {title && <h2 css={tw`text-3xl text-center text-white/90 font-semibold tracking-tight py-4 mb-2`}>{title}</h2>}
        <FlashMessageRender css={tw`mb-4 px-1`} />
        <Form {...props} ref={ref}>
            <GlassCard>
                <div css={tw`flex-none select-none md:pr-4`}>
                    <img src={'/assets/svgs/pterodactyl.svg'} css={tw`block w-32 md:w-48 mx-auto drop-shadow-xl`} alt="Logo" />
                </div>
                <div css={tw`flex-1 w-full`}>{props.children}</div>
            </GlassCard>
        </Form>
        <p css={tw`text-center text-white/30 text-xs mt-6 tracking-wide`}>
            &copy; 2015 - {new Date().getFullYear()}&nbsp;
            <a
                rel={'noopener nofollow noreferrer'}
                href={'https://chalixus.com'}
                target={'_blank'}
                css={tw`no-underline text-white/40 hover:text-white/70 transition-colors`}
            >
                Chalixus Software
            </a>
        </p>
    </Container>
));
