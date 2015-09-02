<?php

namespace Wikibase\Lib;

use Language;

/**
 * Formatter for machine-readable autocomments as generated by SummaryFormatter in the repo.
 *
 * @since 0.5
 *
 * @licence GNU GPL v2+
 *
 * @author Brad Jorsch
 * @author Thiemo Mättig
 * @author Tobias Gritschacher
 * @author Daniel Kinzler
 */
class AutoCommentFormatter {

	/**
	 * @var Language
	 */
	private $language;

	/**
	 * @var string
	 */
	private $messagePrefix;

	/**
	 * @param Language $language
	 * @param string $messagePrefix
	 */
	public function __construct( Language $language, $messagePrefix ) {
		$this->language = $language;
		$this->messagePrefix = $messagePrefix;
	}

	/**
	 * Pretty formatting of autocomments.
	 *
	 * @warning This method is used to parse and format autocomment strings from
	 * the revision history. It should remain compatible with any old autocomment
	 * strings that may be in the database.
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/FormatAutocomments
	 * @see docs/summaries.txt
	 *
	 * @param string $auto the autocomment unformatted
	 *
	 * @return string|null The localized summary, or null
	 */
	public function formatAutoComment( $auto ) {
		if ( !preg_match( '/^([a-z\-]+)\s*(:\s*(.*?)\s*)?$/', $auto, $matches ) ) {
			return null;
		}

		// turn the args to the message into an array
		$args = isset( $matches[3] ) ? explode( '|', $matches[3] ) : array();

		// look up the message
		$msg = wfMessage( $this->messagePrefix . '-summary-' . $matches[1] );

		if ( !$msg->exists() || $msg->isDisabled() ) {
			return null;
		}

		// parse the autocomment
		$auto = $msg->params( $args )->parse();
		return $auto;
	}

	/**
	 * Wrapps a comment by applying the appropriate directionality markers and pre and/or postfix
	 * separators.
	 *
	 * @note This code should be kept in sync with what Linker::formatAutocomments does.
	 *
	 * @param boolean $pre True if there is text before the comment, so a prefix separator is needed.
	 * @param string $comment the localized comment, as returned by formatAutoComment()
	 * @param boolean $post True if there is text after the comment, so a postfix separator is needed.
	 *
	 * @return string
	 */
	public function wrapAutoComment( $pre, $comment, $post ) {
		if ( $pre ) {
			# written summary $presep autocomment (summary /* section */)
			$pre = wfMessage( 'autocomment-prefix' )->inLanguage( $this->language )->escaped();
		}
		if ( $post ) {
			# autocomment $postsep written summary (/* section */ summary)
			$comment .= wfMessage( 'colon-separator' )->inLanguage( $this->language )->escaped();
		}
		$comment = '<span class="autocomment">' . $comment . '</span>';
		$comment = $pre . $this->language->getDirMark()
			. '<span dir="auto">' . $comment;
		$comment .= '</span>';

		return $comment;
	}

}