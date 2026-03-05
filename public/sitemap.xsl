<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
<xsl:output method="html" indent="yes" encoding="UTF-8"/>
<xsl:template match="/">
<html>
<head>
  <title>Sitemap — Logflix</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; background: #0a0a0f; color: #e0e0e0; }
    h1 { font-size: 1.4rem; margin-bottom: 16px; color: #fff; }
    p { color: #888; font-size: 0.85rem; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th { text-align: left; padding: 8px 12px; background: #1a1a2e; color: #aaa; font-weight: 600; border-bottom: 1px solid #333; }
    td { padding: 8px 12px; border-bottom: 1px solid #1a1a2e; }
    a { color: #6ea8fe; text-decoration: none; }
    a:hover { text-decoration: underline; }
    tr:hover td { background: #111122; }
  </style>
</head>
<body>
  <h1>Sitemap</h1>
  <p>This sitemap contains <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs.</p>
  <table>
    <tr><th>URL</th><th>Priority</th><th>Change Freq</th><th>Last Modified</th></tr>
    <xsl:for-each select="sitemap:urlset/sitemap:url">
      <tr>
        <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
        <td><xsl:value-of select="sitemap:priority"/></td>
        <td><xsl:value-of select="sitemap:changefreq"/></td>
        <td><xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/></td>
      </tr>
    </xsl:for-each>
  </table>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
