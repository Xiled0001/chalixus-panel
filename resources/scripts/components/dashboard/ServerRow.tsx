import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthernet, faHdd, faMemory, faMicrochip, faServer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';
import styled from 'styled-components/macro';
import isEqual from 'react-fast-compare';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

const getStatusColor = (status: ServerPowerState | undefined): string => {
    if (!status || status === 'offline') return '#ef4444'; // red
    if (status === 'running') return '#22c55e';            // green
    return '#eab308';                                       // yellow (starting/stopping)
};

// ─── Styled components ────────────────────────────────────────────────────────

const ServerCard = styled(Link)<{ $status: ServerPowerState | undefined }>`
    ${tw`flex rounded-3xl no-underline overflow-hidden transition-all duration-250 ease-out relative`};
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35), 0 1px 4px rgba(0, 0, 0, 0.2);

    &:hover {
        transform: translateY(-4px);
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.13);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.25);
        text-decoration: none;
    }

    /* Left vertical status strip */
    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        border-radius: 3px 0 0 3px;
        background: ${({ $status }) => getStatusColor($status)};
        box-shadow: 0 0 12px ${({ $status }) => getStatusColor($status)};
        opacity: 0.85;
        transition: opacity 200ms ease;
    }

    &:hover::before {
        opacity: 1;
    }
`;

const ServerIconBox = styled.div`
    ${tw`rounded-2xl flex items-center justify-center flex-shrink-0`};
    width: 3.25rem;
    height: 3.25rem;
    background: rgba(108, 92, 255, 0.12);
    border: 1px solid rgba(108, 92, 255, 0.22);
    color: rgba(108, 92, 255, 0.85);
    font-size: 1.1rem;
`;

const StatBadge = styled.div<{ $alarm?: boolean }>`
    ${tw`flex flex-col items-center`};

    .stat-value {
        ${tw`flex items-center gap-1 text-sm font-medium`};
        color: ${({ $alarm }) => $alarm ? '#ef4444' : 'rgba(255,255,255,0.85)'};
        ${({ $alarm }) => $alarm && 'text-shadow: 0 0 8px rgba(239,68,68,0.4);'};

        svg {
            font-size: 0.7rem;
            opacity: 0.7;
            color: ${({ $alarm }) => $alarm ? '#ef4444' : 'rgba(108,92,255,0.7)'};
        }
    }

    .stat-limit {
        ${tw`text-xs`};
        color: rgba(255, 255, 255, 0.28);
        margin-top: 2px;
    }
`;

// ─── Component ────────────────────────────────────────────────────────────────

type Timer = ReturnType<typeof setInterval>;

export default ({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended) return;
        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });
        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended]);

    const alarms = { cpu: false, memory: false, disk: false };
    if (stats) {
        alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
        alarms.disk = server.limits.disk === 0 ? false : isAlarmState(stats.diskUsageInBytes, server.limits.disk);
    }

    const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : '∞';
    const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : '∞';
    const cpuLimit = server.limits.cpu !== 0 ? server.limits.cpu + '%' : '∞';

    return (
        <ServerCard
            to={`/server/${server.id}`}
            className={className}
            $status={stats?.status}
        >
            {/* Content padding — left offset for status strip */}
            <div css={tw`flex w-full items-center gap-4 p-4 pl-5`}>
                {/* Server icon */}
                <ServerIconBox>
                    <FontAwesomeIcon icon={faServer} />
                </ServerIconBox>

                {/* Name + description */}
                <div css={tw`flex-1 min-w-0`}>
                    <p css={tw`text-base font-semibold text-white truncate`}>{server.name}</p>
                    {!!server.description && (
                        <p css={tw`text-xs text-white/40 truncate mt-0.5 line-clamp-1`}>{server.description}</p>
                    )}
                    {/* IP allocation — shown on small screens */}
                    <div css={tw`flex items-center gap-1 mt-1 sm:hidden`}>
                        <FontAwesomeIcon icon={faEthernet} css={tw`text-white/25 text-xs`} />
                        <span css={tw`text-xs text-white/40`}>
                            {server.allocations
                                .filter((a) => a.isDefault)
                                .map((a) => (
                                    <React.Fragment key={a.ip + a.port.toString()}>
                                        {a.alias || ip(a.ip)}:{a.port}
                                    </React.Fragment>
                                ))}
                        </span>
                    </div>
                </div>

                {/* IP (hidden on mobile) */}
                <div css={tw`hidden lg:flex flex-col items-center min-w-[110px]`}>
                    <div css={tw`flex items-center gap-1.5`}>
                        <FontAwesomeIcon icon={faEthernet} css={tw`text-white/30 text-xs`} />
                        <span css={tw`text-xs text-white/50`}>
                            {server.allocations
                                .filter((a) => a.isDefault)
                                .map((a) => (
                                    <React.Fragment key={a.ip + a.port.toString()}>
                                        {a.alias || ip(a.ip)}:{a.port}
                                    </React.Fragment>
                                ))}
                        </span>
                    </div>
                </div>

                {/* Resource stats */}
                <div css={tw`hidden sm:flex items-center gap-5 ml-auto`}>
                    {!stats || isSuspended ? (
                        isSuspended ? (
                            <span
                                css={tw`text-xs font-semibold px-2.5 py-1 rounded-xl`}
                                style={{
                                    background: 'rgba(239,68,68,0.15)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    color: '#fca5a5',
                                }}
                            >
                                {server.status === 'suspended' ? 'Suspended' : 'Connection Error'}
                            </span>
                        ) : server.isTransferring || server.status ? (
                            <span
                                css={tw`text-xs font-semibold px-2.5 py-1 rounded-xl`}
                                style={{
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    color: 'rgba(255,255,255,0.6)',
                                }}
                            >
                                {server.isTransferring
                                    ? 'Transferring'
                                    : server.status === 'installing'
                                    ? 'Installing'
                                    : server.status === 'restoring_backup'
                                    ? 'Restoring'
                                    : 'Unavailable'}
                            </span>
                        ) : (
                            <Spinner size={'small'} />
                        )
                    ) : (
                        <>
                            <StatBadge $alarm={alarms.cpu}>
                                <div className={'stat-value'}>
                                    <FontAwesomeIcon icon={faMicrochip} />
                                    {stats.cpuUsagePercent.toFixed(1)}%
                                </div>
                                <div className={'stat-limit'}>of {cpuLimit}</div>
                            </StatBadge>
                            <StatBadge $alarm={alarms.memory}>
                                <div className={'stat-value'}>
                                    <FontAwesomeIcon icon={faMemory} />
                                    {bytesToString(stats.memoryUsageInBytes)}
                                </div>
                                <div className={'stat-limit'}>of {memoryLimit}</div>
                            </StatBadge>
                            <StatBadge $alarm={alarms.disk}>
                                <div className={'stat-value'}>
                                    <FontAwesomeIcon icon={faHdd} />
                                    {bytesToString(stats.diskUsageInBytes)}
                                </div>
                                <div className={'stat-limit'}>of {diskLimit}</div>
                            </StatBadge>
                        </>
                    )}
                </div>
            </div>
        </ServerCard>
    );
};
