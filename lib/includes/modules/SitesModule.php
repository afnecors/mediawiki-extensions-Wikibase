<?php

namespace Wikibase;
use MediaWikiSite;
use ResourceLoaderContext;
use ResourceLoaderModule;
use Site;
use SiteSQLStore;

/**
 *
 * @since 0.2
 * @todo This modules content should be invalidated whenever sites stuff (config) changes
 *
 * @licence GNU GPL v2+
 * @author Jeroen De Dauw < jeroendedauw@gmail.com >
 * @author Daniel Werner < daniel.werner@wikimedia.de >
 */
class SitesModule extends ResourceLoaderModule {

	/**
	 * Used to propagate information about sites to JavaScript.
	 * Sites infos will be available in 'wbSiteDetails' config var.
	 * @see ResourceLoaderModule::getScript
	 *
	 * @since 0.2
	 *
	 * @param ResourceLoaderContext $context
	 *
	 * @return string
	 */
	public function getScript( ResourceLoaderContext $context ) {
		$sites = array();

		$groups = Settings::get( "siteLinkGroups" );
		$specialGroups = Settings::get( "specialSiteLinkGroups" );

		/**
		 * @var MediaWikiSite $site
		 */
		foreach ( SiteSQLStore::newInstance()->getSites() as $site ) {
			$group = $site->getGroup();

			if ( !$this->shouldSiteBeIncluded( $site, $groups, $specialGroups ) ) {
				continue;
			}

			// FIXME: quickfix to allow a custom site-name / handling for the site groups which are
			// special according to the specialSiteLinkGroups setting
			if ( in_array( $group, $specialGroups ) ) {
				$languageNameMsg = wfMessage( 'wikibase-sitelinks-sitename-' . $site->getGlobalId() );
				$languageName = $languageNameMsg->exists() ? $languageNameMsg->parse() : $site->getGlobalId();
				$groupName = 'special';
			} else {
				$languageName = Utils::fetchLanguageName( $site->getLanguageCode() );
				$groupName = $group;
			}
			$globalId = $site->getGlobalId();

			// Use protocol relative URIs, as it's safe to assume that all wikis support the same protocol
			list( $pageUrl, $apiUrl ) = preg_replace(
				"/^https?:/i",
				'',
				array(
					$site->getPageUrl(),
					$site->getFileUrl( 'api.php' )
				)
			);

			//TODO: figure out which name ist best
			//$localIds = $site->getLocalIds();
			//$name = empty( $localIds['equivalent'] ) ? $site->getGlobalId() : $localIds['equivalent'][0];

			$sites[ $globalId ] = array(
				'shortName' => $languageName,
				'name' => $languageName, // use short name for both, for now
				'id' => $globalId,
				'pageUrl' => $pageUrl,
				'apiUrl' => $apiUrl,
				'languageCode' => $site->getLanguageCode(),
				'group' => $groupName
			);
		}

		return 'mediaWiki.config.set( "wbSiteDetails", ' . \FormatJson::encode( $sites ) . ' );';
	}

	/**
	 * Whether it's needed to add a Site to the JS variable.
	 *
	 * @param Site $site
	 * @param array $groups
	 * @param array $specialGroups
	 *
	 * @return bool
	 */
	private function shouldSiteBeIncluded( Site $site, array $groups, array $specialGroups ) {
		if ( in_array( 'special', $groups ) ) {
			// The "special" group actually maps to multiple groups
			$groups = array_diff( $groups, array( 'special' ) );
			$groups = array_merge( $groups, $specialGroups );
		}

		if ( $site->getType() === Site::TYPE_MEDIAWIKI && in_array( $site->getGroup(), $groups ) ) {
			return true;
		}

		return false;
	}
}
