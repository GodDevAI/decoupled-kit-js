import { NextSeo } from 'next-seo';
import {
	setEdgeHeader,
	addSurrogateKeyHeader,
} from '@pantheon-systems/wordpress-kit';

import { PageGridItem } from '../../components/grid';
import { withGrid, Paginator } from '@pantheon-systems/nextjs-kit';
import Layout from '../../components/layout';
import PageHeader from '../../components/page-header';

import { getFooterMenu } from '../../lib/Menus';
import { getLatestPages } from '../../lib/Pages';
import { getSurrogateKeys } from '../../lib/getSurrogateKeys';

export default function PageListTemplate({ menuItems, pages }) {
	const PagesGrid = withGrid(PageGridItem);

	const RenderCurrentItems = ({ currentItems }) => {
		return <PagesGrid contentType="pages" data={currentItems} />;
	};

	return (
		<Layout footerMenu={menuItems}>
			<NextSeo
				title="Decoupled Next WordPress Demo"
				description="Generated by create next app."
			/>
			<div className="max-w-screen-lg mx-auto">
				<section>
					<PageHeader title="Pages" />
					<Paginator
						data={pages}
						itemsPerPage={12}
						Component={RenderCurrentItems}
					/>
				</section>
			</div>
		</Layout>
	);
}

export async function getServerSideProps({ res }) {
	const { menuItems, menuItemHeaders } = await getFooterMenu();
	const { pages, headers } = await getLatestPages(100);

	const keys = getSurrogateKeys({ headers: [menuItemHeaders, headers] });
	addSurrogateKeyHeader(keys, res);
	setEdgeHeader({ res });
	return {
		props: {
			menuItems,
			pages,
		},
	};
}
