<?php

namespace Wikibase\Client\Tests\DataAccess;

use PHPUnit_Framework_TestCase;
use Wikibase\Client\DataAccess\PropertyIdResolver;
use Wikibase\Client\PropertyLabelNotResolvedException;
use Wikibase\Client\Usage\HashUsageAccumulator;
use Wikibase\Client\Usage\UsageAccumulator;
use Wikibase\DataModel\Entity\Property;
use Wikibase\DataModel\Entity\PropertyId;
use Wikibase\Lib\Tests\MockPropertyLabelResolver;
use Wikibase\Lib\Tests\MockRepository;

/**
 * @covers Wikibase\Client\DataAccess\PropertyIdResolver
 *
 * @group Wikibase
 * @group WikibaseClient
 * @group WikibaseDataAccess
 *
 * @license GPL-2.0+
 * @author Katie Filbert < aude.wiki@gmail.com >
 */
class PropertyIdResolverTest extends PHPUnit_Framework_TestCase {

	private function getPropertyIdResolver( UsageAccumulator $usageAccumulator = null ) {
		$mockRepository = $this->getMockRepository();
		$propertyLabelResolver = new MockPropertyLabelResolver( 'en', $mockRepository );

		$usageAccumulator = $usageAccumulator ?: new HashUsageAccumulator();

		return new PropertyIdResolver(
			$mockRepository,
			$propertyLabelResolver,
			$usageAccumulator
		);
	}

	private function getMockRepository() {
		$propertyId = new PropertyId( 'P1337' );

		$property = Property::newFromType( 'string' );
		$property->setId( $propertyId );
		$property->setLabel( 'en', 'a kitten!' );

		$mockRepository = new MockRepository();
		$mockRepository->putEntity( $property );

		return $mockRepository;
	}

	/**
	 * @dataProvider resolvePropertyIdProvider
	 */
	public function testResolvePropertyId( $propertyLabelOrId, $expectedId, array $expectedUsages ) {
		$usageAccumulator = new HashUsageAccumulator();
		$propertyIdResolver = $this->getPropertyIdResolver( $usageAccumulator );

		$id = $propertyIdResolver->resolvePropertyId( $propertyLabelOrId, 'en' );

		$this->assertSame( $expectedId, $id->getSerialization() );
		$this->assertSame( $expectedUsages, array_keys( $usageAccumulator->getUsages() ) );
	}

	public function resolvePropertyIdProvider() {
		return [
			[ 'a kitten!', 'P1337', [ 'P1337#L.en' ] ],
			[ 'p1337', 'P1337', [] ],
			[ 'P1337', 'P1337', [] ],
		];
	}

	/**
	 * @dataProvider resolvePropertyIdWithInvalidInput_throwsExceptionProvider
	 */
	public function testResolvePropertyIdWithInvalidInput_throwsException( $propertyIdOrLabel ) {
		$propertyIdResolver = $this->getPropertyIdResolver();

		$this->setExpectedException( PropertyLabelNotResolvedException::class );

		$propertyIdResolver->resolvePropertyId( $propertyIdOrLabel, 'en' );
	}

	public function resolvePropertyIdWithInvalidInput_throwsExceptionProvider() {
		return [
			[ 'hedgehog' ],
			[ 'Q100' ],
			[ 'P1444' ]
		];
	}

}
