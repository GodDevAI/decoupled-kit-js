import { render } from '@testing-library/react';
import Recipe from '../../components/recipe';

/**
 * @vitest-environment jsdom
 */

const recipe = {
	title: 'Guacamole',
	category: 'Snacks',
	ingredients: [
		'1 Avocado',
		'1/2 tomato',
		'1/2 onion',
		'salt',
		'lime',
		'black pepper',
		'cilantro',
	],
	instructions:
		'<ol>\n  <li>Use a little of the sunflower oil to grease an 8 inch square baking tin (or similar size) and line the tin with greaseproof paper.</li>\n  <li>Preheat the oven to 350°F/180°C.</li>\n  <li>Break approximately 1/3rd of the chocolate bar off and chop into small pieces. Roughly chop 2/3rds of the pecan nuts and mix together with the chopped chocolate. Set aside.</li>\n  <li>For finishing the brownies, chop or crush the remaining pecan nuts and walnuts, mix together and set aside.</li>\n  <li>Melt the remaining chocolate by bringing a couple inches of water to the boil in a small saucepan that is suitably sized for holding a heatproof bowl in the pan opening. Do not allow the bottom of the heatproof bowl to touch the water. Place the chocolate into the bowl to melt, stirring occasionally to ensure the chocolate has fully melted. Once melted, set aside and allow to cool slightly.</li>\n  <li>Whilst the chocolate is melting, begin to sieve the plain flour, coconut flour, and cocoa powder into a large mixing bowl and mix. Once mixed, stir in the baking powder and sugar.</li>\n  <li>Once the chocolate has cooled a little, begin to slowly stir the vanilla essence, sunflower oil, soya milk, and melted chocolate into the flour and cocoa mix.</li>\n  <li>Now stir in the previously chopped chocolate and pecan nuts, ensuring they are stirred evenly into the mixture.</li>\n  <li>Pour the mixture into the baking tin and spread evenly with a spatula.</li>\n  <li>Sprinkle the chopped pecan nuts and walnuts across the top and bake in the centre of the oven for 18 to 23 minutes.</li>\n  <li>Remove from the oven and allow to cool for 45 minutes. Carefully use the edges of the greaseproof paper to lift the brownie out of the tin and place onto a chopping board. With a sharp knife, gently cut into evenly sized pieces.</li>\n  <li>Serve on their own or with some vegan cream or ice cream.</li>\n</ol>\n',
	imgSrc:
		'https://dev-decoupled-drupal-qa.pantheonsite.io/sites/default/files/2022-07/guacamole.jpeg',
};
describe('<Recipe />', () => {
	it("should render 'recipe'", () => {
		const { asFragment } = render(
			<Recipe
				title={recipe.title}
				category={recipe.category}
				imageProps={{
					priority: true,
					src: recipe.imgSrc,
					layout: 'fill',
					objectFit: 'cover',
				}}
				ingredients={recipe.ingredients}
				instructions={recipe.instructions}
				previousPagePath={'/recipes'}
			/>,
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
