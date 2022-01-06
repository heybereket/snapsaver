import {Tooltip as ReactTooltip, Position} from 'react-tippy';

interface TooltipProps {
	title: string;
	position?: Position;
	children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = (props: TooltipProps) => {
	return (
		<ReactTooltip
			followCursor
			inertia
			position={props.position}
			title={props.title}
			theme="dark"
			animation="scale"
			animateFill={false}
			duration={300}
		>
			{props.children}
		</ReactTooltip>
	);
};