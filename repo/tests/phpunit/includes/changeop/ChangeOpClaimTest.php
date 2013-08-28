<?php

namespace Wikibase\Test;

use Wikibase\ChangeOpClaim;
use Wikibase\Claim;
use Wikibase\Claims;
use Wikibase\Entity;
use Wikibase\EntityId;
use Wikibase\ItemContent;
use InvalidArgumentException;
use Wikibase\PropertyNoValueSnak;
use Wikibase\PropertySomeValueSnak;
use Wikibase\SnakObject;

/**
 * @covers Wikibase\ChangeOpClaim
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA
 *
 * @file
 * @since 0.4
 *
 * @ingroup Wikibase
 * @ingroup Test
 *
 * @group Wikibase
 * @group WikibaseRepo
 * @group ChangeOp
 *
 * @licence GNU GPL v2+
 * @author Adam Shorland
 */
class ChangeOpClaimTest extends \PHPUnit_Framework_TestCase {

	public function invalidConstructorProvider() {
		$args = array();
		$args[] = array( 42, 'add' );
		$args[] = array( 'en', 'remove' );
		$args[] = array( array(), 'remove' );
		return $args;
	}

	/**
	 * @dataProvider invalidConstructorProvider
	 * @expectedException InvalidArgumentException
	 *
	 * @param Claim $claim
	 * @param string $action
	 */
	public function testInvalidConstruct( $claim, $action ) {
		$changeOp = new ChangeOpClaim( $claim, $action );
	}

	public function changeOpClaimProvider() {
		$noValueClaim = new Claim( new PropertyNoValueSnak( 43 ) );

		$differentEntity = ItemContent::newEmpty()->getEntity();
		$differentEntity->setId( new EntityId( 'item', 777 ) );
		$oldNoValueClaim = $differentEntity->newClaim( new PropertyNoValueSnak( 43 ) );

		$entity = ItemContent::newEmpty()->getEntity();
		$entity->setId( new EntityId( 'item', 555 ) );
		$someValueClaim = new Claim( new PropertySomeValueSnak( 44 ) );
		$newNoValueClaim = $entity->newClaim( new PropertyNoValueSnak( 43 ) );
		$args = array();

		$args[] = array ( $entity, clone $noValueClaim , 'add' , array( clone $noValueClaim ) );
		$args[] = array ( $entity, clone $someValueClaim , 'add' , array( clone $noValueClaim, clone $someValueClaim ) );
		$args[] = array ( $entity, clone $noValueClaim , 'remove' , array( clone $someValueClaim ) );
		$args[] = array ( $entity, clone $someValueClaim , 'remove' , array( ) );
		$args[] = array ( $entity, clone $oldNoValueClaim , 'add' , array( clone $newNoValueClaim ) );
		$args[] = array ( $entity, clone $newNoValueClaim , 'remove' , array( ) );

		return $args;
	}

	/**
	 * @dataProvider changeOpClaimProvider
	 *
	 * @param Entity $entity
	 * @param $claim
	 * @param $action
	 * @param Claim[] $expectedClaims
	 * @internal param \Wikibase\ChangeOpClaim $changeOpClaim
	 */
	public function testApply( $entity, $claim, $action, $expectedClaims ) {
		$changeOpClaim = new ChangeOpClaim( $claim, $action );
		$changeOpClaim->apply( $entity );
		$entityClaims = new Claims( $entity->getClaims() );
		foreach( $expectedClaims as $expectedClaim ){
			$this->assertTrue( $entityClaims->hasClaim( $expectedClaim ) );
		}
		$this->assertEquals( count( $expectedClaims ), $entityClaims->count() );
	}

	/**
	 * @expectedException \Wikibase\ChangeOpException
	 */
	public function testApplyWithInvalidAction() {
		$item = ItemContent::newEmpty();
		$entity = $item->getEntity();
		$changeOpClaim = new ChangeOpClaim( new Claim( new PropertyNoValueSnak( 43 ) ) , 'invalidAction'  );
		$changeOpClaim->apply( $entity );
	}

}
