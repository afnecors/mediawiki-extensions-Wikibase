<?php

class PrimarySourcesHooks {

    public static function onBeforePageDisplay( OutputPage &$out, Skin &$skin ) {
        $out->addModules( 'ext.PrimarySources.init' );
        return true;
    }

}