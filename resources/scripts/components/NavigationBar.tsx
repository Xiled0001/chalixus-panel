import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';

// ─── Styled pieces ────────────────────────────────────────────────────────────

const NavBar = styled.div`
    ${tw`w-full overflow-x-auto`};
    background: rgba(11, 15, 26, 0.85);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    box-shadow: 0 4px 32px rgba(0, 0, 0, 0.4);
    position: sticky;
    top: 0;
    z-index: 100;
`;

const NavInner = styled.div`
    ${tw`mx-auto w-full flex items-center`};
    height: 4rem;
    max-width: 1200px;
    padding: 0 1rem;
`;

const LogoLink = styled(Link)`
    ${tw`flex-1 no-underline font-header font-semibold text-xl tracking-tight transition-all duration-200`};
    background: linear-gradient(135deg, #6c5cff 0%, #00d4ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    &:hover {
        filter: brightness(1.15);
    }
`;

const RightNavigation = styled.div`
    ${tw`flex h-full items-center`};

    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center justify-center h-full no-underline cursor-pointer transition-all duration-200`};
        padding: 0 0.9rem;
        color: rgba(255, 255, 255, 0.50);
        font-size: 1rem;
        position: relative;

        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #6c5cff, #00d4ff);
            border-radius: 1px;
            transition: width 200ms ease;
        }

        &:hover {
            color: rgba(255, 255, 255, 0.90);
            &::after { width: 60%; }
        }

        &.active,
        &:active {
            color: #ffffff;
            &::after {
                width: 70%;
                box-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
            }
        }

        & svg {
            width: 1.1rem;
            height: 1.1rem;
        }
    }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <NavBar>
            <SpinnerOverlay visible={isLoggingOut} />
            <NavInner>
                <LogoLink to={'/'}>
                    {name}
                </LogoLink>
                <RightNavigation>
                    <SearchContainer />
                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavLink to={'/'} exact>
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </NavLink>
                    </Tooltip>
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Admin'}>
                            <a href={'/admin'} rel={'noreferrer'}>
                                <FontAwesomeIcon icon={faCogs} />
                            </a>
                        </Tooltip>
                    )}
                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <NavLink to={'/account'}>
                            <span css={tw`flex items-center w-5 h-5`}>
                                <Avatar.User />
                            </span>
                        </NavLink>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Sign Out'}>
                        <button onClick={onTriggerLogout}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </RightNavigation>
            </NavInner>
        </NavBar>
    );
};
