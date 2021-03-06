<?php

namespace Wikibase\Client\Tests\DataAccess\PropertyParserFunction;

use Language;
use MediaWikiTestCase;
use Parser;
use ParserOptions;
use Title;
use User;
use Wikibase\Client\Tests\DataAccess\WikibaseDataAccessTestItemSetUpHelper;
use Wikibase\Client\WikibaseClient;
use Wikibase\Client\Usage\ParserOutputUsageAccumulator;
use Wikibase\Test\MockClientStore;

/**
 * Simple integration test for the {{#property:…}} parser function.
 *
 * @group Wikibase
 * @group WikibaseClient
 * @group WikibaseDataAccess
 * @group WikibaseIntegration
 * @group Database
 *
 * @license GPL-2.0+
 * @author Marius Hoch < hoo@online.de >
 */
class PropertyParserFunctionIntegrationTest extends MediaWikiTestCase {

	/**
	 * @var bool
	 */
	private $oldAllowDataAccessInUserLanguage;

	protected function setUp() {
		parent::setUp();

		$wikibaseClient = WikibaseClient::getDefaultInstance( 'reset' );
		$store = $wikibaseClient->getStore();

		if ( !( $store instanceof MockClientStore ) ) {
			$store = new MockClientStore( 'de' );
			$wikibaseClient->overrideStore( $store );
		}

		$this->assertInstanceOf(
			MockClientStore::class,
			$wikibaseClient->getStore(),
			'Mocking the default ClientStore failed'
		);

		$this->setMwGlobals( 'wgContLang', Language::factory( 'de' ) );

		$setupHelper = new WikibaseDataAccessTestItemSetUpHelper( $store );
		$setupHelper->setUp();

		$this->oldAllowDataAccessInUserLanguage = $wikibaseClient->getSettings()->getSetting( 'allowDataAccessInUserLanguage' );
		$this->setAllowDataAccessInUserLanguage( false );
	}

	protected function tearDown() {
		parent::tearDown();

		$this->setAllowDataAccessInUserLanguage( $this->oldAllowDataAccessInUserLanguage );
		WikibaseClient::getDefaultInstance( 'reset' );
	}

	/**
	 * @param bool $value
	 */
	private function setAllowDataAccessInUserLanguage( $value ) {
		$settings = WikibaseClient::getDefaultInstance()->getSettings();
		$settings->setSetting( 'allowDataAccessInUserLanguage', $value );
	}

	public function testPropertyParserFunction_byPropertyLabel() {
		$result = $this->parseWikitextToHtml( '{{#property:LuaTestStringProperty}}' );

		$this->assertSame( "<p>Lua&#160;:)\n</p>", $result->getText() );

		$usageAccumulator = new ParserOutputUsageAccumulator( $result );
		$this->assertArrayEquals(
			[ 'P342#L.de', 'Q32487#O' ],
			array_keys( $usageAccumulator->getUsages() )
		);
	}

	public function testPropertyParserFunction_byPropertyId() {
		$result = $this->parseWikitextToHtml( '{{#property:P342}}' );

		$this->assertSame( "<p>Lua&#160;:)\n</p>", $result->getText() );

		$usageAccumulator = new ParserOutputUsageAccumulator( $result );
		$this->assertArrayEquals(
			[ 'Q32487#O' ],
			array_keys( $usageAccumulator->getUsages() )
		);
	}

	public function testPropertyParserFunction_arbitraryAccess() {
		$result = $this->parseWikitextToHtml( '{{#property:P342|from=Q32488}}' );

		$this->assertSame( "<p>Lua&#160;:)\n</p>", $result->getText() );

		$usageAccumulator = new ParserOutputUsageAccumulator( $result );
		$this->assertArrayEquals(
			[ 'Q32488#O' ],
			array_keys( $usageAccumulator->getUsages() )
		);
	}

	public function testPropertyParserFunction_multipleValues() {
		$result = $this->parseWikitextToHtml( '{{#property:P342|from=Q32489}}' );

		$this->assertSame( "<p>Lua&#160;:), Lua&#160;:)\n</p>", $result->getText() );

		$usageAccumulator = new ParserOutputUsageAccumulator( $result );
		$this->assertArrayEquals(
			[ 'Q32489#O' ],
			array_keys( $usageAccumulator->getUsages() )
		);
	}

	public function testPropertyParserFunction_arbitraryAccessNotFound() {
		$result = $this->parseWikitextToHtml( '{{#property:P342|from=Q1234567}}' );

		$this->assertSame( '', $result->getText() );

		$usageAccumulator = new ParserOutputUsageAccumulator( $result );
		$this->assertArrayEquals(
			[ 'Q1234567#O' ],
			array_keys( $usageAccumulator->getUsages() )
		);
	}

	public function testPropertyParserFunction_byNonExistent() {
		$result = $this->parseWikitextToHtml( '{{#property:P2147483647}}' );

		$this->assertRegExp(
			'/<p.*class=".*wikibase-error.*">.*P2147483647.*<\/p>/',
			$result->getText()
		);

		$usageAccumulator = new ParserOutputUsageAccumulator( $result );
		$this->assertArrayEquals(
			[ 'Q32487#O' ],
			array_keys( $usageAccumulator->getUsages() )
		);
	}

	public function testPropertyParserFunction_pageNotConnected() {
		$result = $this->parseWikitextToHtml(
			'{{#property:P342}}',
			'A page not connected to an item'
		);

		$this->assertSame( '', $result->getText() );

		$usageAccumulator = new ParserOutputUsageAccumulator( $result );
		$this->assertArrayEquals(
			[],
			array_keys( $usageAccumulator->getUsages() )
		);
	}

	/**
	 * @param string $wikiText
	 * @param string $title
	 *
	 * @return ParserOutput
	 */
	private function parseWikitextToHtml( $wikiText, $title = 'WikibaseClientDataAccessTest' ) {
		$popt = new ParserOptions( User::newFromId( 0 ), Language::factory( 'en' ) );

		// FIXME: The conditional is a temporary workaround, remove when done! See T37247.
		if ( is_callable( [ $popt, 'setWrapOutputClass' ] ) ) {
			$popt->setWrapOutputClass( false );
		}

		$parser = new Parser( [ 'class' => 'Parser' ] );
		return $parser->parse( $wikiText, Title::newFromText( $title ), $popt, Parser::OT_HTML );
	}

}
