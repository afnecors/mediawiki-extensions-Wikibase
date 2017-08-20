<?php

if (function_exists('wfLoadExtension')) {
    wfLoadExtension('PrimarySources', __DIR__ . '/extension.json');

    // i18n
    $wgMessagesDirs['PrimarySources'] = __DIR__ . '/i18n';

    $wgAutoloadClasses['PrimarySourcesHooks'] = __DIR__ . '/PrimarySources.hooks.php';

    // Hooks
    $wgHooks['BeforePageDisplay'][] = 'PrimarySourcesHooks::onBeforePageDisplay';

    return;
} else {
    die('This version of the PrimarySources extension requires MediaWiki 1.25+');
}
