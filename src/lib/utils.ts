import { routesColor } from './routeNameColor';

export function createColorMatchExpression(defaultColor: string = 'black') {
	const expression = ['match', ['get', 'route_long_name']];
	routesColor.forEach((route) => [expression.push(route.route), expression.push(route.color)]);
	expression.push(defaultColor);
	return expression;
}
