<?php

namespace Wikibase\Repo;

use Wikibase\DataModel\Entity\Item;

/**
 * @license GPL-2.0+
 * @author Katie Filbert < aude.wiki@gmail.com >
 * @author Thiemo Mättig
 */
class ItemSearchTextGenerator {

	/**
	 * @param Item $item
	 *
	 * @return string
	 */
	public function generate( Item $item ) {
		$fingerprintGenerator = new FingerprintSearchTextGenerator();
		$text = $fingerprintGenerator->generate( $item );

		foreach ( $item->getSiteLinkList()->toArray() as $siteLink ) {
			$text .= "\n" . $siteLink->getPageName();
		}

		return trim( $text, "\n" );
	}

}
