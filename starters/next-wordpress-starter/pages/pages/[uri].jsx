import { NextSeo } from 'next-seo';
import Layout from '../../components/layout';
import Page from '../../components/page';

import { getFooterMenu } from '../../lib/Menus';
import { getAllPagesUri, getPageByUri } from '../../lib/Pages';

export default function PageListTemplate({ menuItems, page }) {
	return (
		<Layout footerMenu={menuItems}>
			<NextSeo
				title="Decoupled Next WordPress Demo"
				description="Generated by create next app."
			/>
			<Page page={page} />
		</Layout>
	);
}

export async function getServerSideProps({ params: { uri } }) {
	const menuItems = await getFooterMenu();
	const page = await getPageByUri(uri);

	return {
		props: {
			menuItems,
			page,
		},
	};
}
