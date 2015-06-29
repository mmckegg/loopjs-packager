<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:wix="http://schemas.microsoft.com/wix/2006/wi"
                xmlns="http://schemas.microsoft.com/wix/2006/wi"
                exclude-result-prefixes="xsl wix">

  <xsl:output method="xml" indent="yes" omit-xml-declaration="yes" />

  <xsl:strip-space elements="*"/>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()"/>
    </xsl:copy>
  </xsl:template>

	<xsl:template match="wix:Directory[@Name='Loop Drop-win32']">
		<xsl:apply-templates select="*" />
  	</xsl:template>

	<xsl:template match="wix:File[contains(@Source,'\Loop Drop.exe')]">
	  	<xsl:copy>
	  		<xsl:apply-templates select="@*" />
	  		<xsl:attribute name="Id">AppExecutable</xsl:attribute>
	  	</xsl:copy>
	  	<Shortcut Id='StartMenuShortcut'
	          Advertise="yes"
	          Name='Loop Drop'
	          Icon='icon.ico'
	          Description='Live Electronic Music Performance Software'
	          WorkingDirectory='APPLICATIONROOTDIRECTORY'
			  Directory="ApplicationProgramsFolder"/>
		<RemoveFolder Id="ApplicationProgramsFolder" On="uninstall"/>
	</xsl:template>



</xsl:stylesheet>