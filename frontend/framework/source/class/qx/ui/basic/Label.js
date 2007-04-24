/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_basic)

************************************************************************ */

/**
 * The Label widget displays plain text or HTML text.
 *
 * Most complex qooxdoo widgets use instances of Label to display text.
 * The label supports auto sizing and internationalization.
 *
 * @appearance label
 */
qx.Class.define("qx.ui.basic.Label",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param text {String} The text of the label (see property {@link #text}).
   * @param mnemonic {String} The mnemonic of the label (see property {@link #mnemonic}).
   * @param mode {String} The mode of the label (see property {@link #mode}).
   */
  construct : function(text, mnemonic, mode)
  {
    this.base(arguments);

    // Apply constructor arguments
    if (mode != null) {
      this.setMode(mode);
    }

    if (text !== undefined) {
      this.setText(text);
    }

    if (mnemonic !== undefined) {
      this.setMnemonic(mnemonic);
    }

    // Prohibit stretching through layout handler
    this.setAllowStretchX(false);
    this.setAllowStretchY(false);

    // Auto sized as default
    this.auto();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * TODOC
     * @internal
     * @type static
     * @param vId {var} TODOC
     * @return {Element} TODOC
     */
    _getMeasureNode : function()
    {
      var node = this._measureNode;

      if (!node)
      {
        node = document.createElement("div");
        var style = node.style;

        style.width = style.height = "auto";
        style.visibility = "hidden";
        style.position = "absolute";
        style.zIndex = "-1";

        document.body.appendChild(node);

        this._measureNode = node;
      }

      return node;
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "label"
    },


    /**
     * The text of the label. How the text is interpreted depends on the value of the
     * property {@link #textMode}.
     */
    text :
    {
      apply : "_applyText",
      init : "",
      event : "changeText"
    },


    /**
     * Set how the label text should be interpreted
     *
     * <ul>
     *   <li><code>text</code> will set the text verbatim. Leading and trailing white space will be reserved.</li>
     *   <li><code>html</code> will interpret the label text as html.</li>
     *   <li><code>auto</code> will try to guess whether the text represents an HTML string or plain text.
     *       This is how older qooxdoo versions treated the text.
     *   </li>
     * <ul>
     */
    mode :
    {
      check : [ "html", "text", "auto" ],
      init : "auto",
      apply : "_applyText"
    },


    /** A single character which will be underlined inside the text. */
    mnemonic :
    {
      check : "String",
      nullable : true,
      apply : "_applyMnemonic"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * @deprecated
     */
    setHtml : function(html)
    {
      this.warn("Deprecated usage of HTML property!");
      this.setText(html);
    },

    /**
     * @deprecated
     */
    getHtml : function(html)
    {
      this.warn("Deprecated usage of HTML property!");
      this.getText(html);
    },

    _htmlContent : "",
    _htmlMode : false,

    _applyFont : function(value, old) {
      qx.manager.object.FontManager.getInstance().connect(this._styleFont, this, value);
    },


    /**
     * @type member
     * @param value {qx.renderer.font.Font}
     */
    _styleFont : function(value)
    {
      this._invalidatePreferredInnerDimensions();
      value ? value.render(this) : qx.renderer.font.Font.reset(this);
    },


    /**
     * Compute the values for "_htmlMode" and "_htmlContent"
     *
     * @type member
     */
    _applyText : function()
    {
      if (this.getText() instanceof qx.locale.LocalizedString)
      {
        var text = this.getText().toString();
        qx.locale.Manager.getInstance().addEventListener("changeLocale", this.__updateText, this);
      }
      else
      {
        text = this.getText() || "";
        qx.locale.Manager.getInstance().removeEventListener("changeLocale", this.__updateText, this);
      }

      switch (this.getMode())
      {
        case "auto":
          this._htmlMode = qx.util.Validation.isValidString(text) && text.match(/<.*>/) ? true : false;
          this._htmlContent = text;
          break;

        case "text":
          var escapedText = qx.xml.String.escape(text).replace(/(^ | $)/g, "&nbsp;").replace(/  /g, "&nbsp;&nbsp;");
          this._htmlMode = escapedText !== text;
          this._htmlContent = escapedText;
          break;

        case "html":
          this._htmlMode = true;
          this._htmlContent = text;
          break;
      }

      if (this._isCreated) {
        this._renderContent();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyMnemonic : function(value, old)
    {
      this._mnemonicTest = value ? new RegExp("^(((<([^>]|" + value + ")+>)|(&([^;]|" + value + ")+;)|[^&" + value + "])*)(" + value + ")", "i") : null;

      if (this._isCreated) {
        this._renderContent();
      }
    },








    /*
    ---------------------------------------------------------------------------
      HELPER FOR PREFERRED DIMENSION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _computeObjectNeededDimensions : function()
    {
      // get node
      var node = this.self(arguments)._getMeasureNode();
      var style = node.style;
      var source = this._styleProperties;

      // sync styles
      style.fontFamily = source.fontFamily || "";
      style.fontSize = source.fontSize || "";
      style.fontWeight = source.fontWeight || "";
      style.fontStyle = source.fontStyle || "";
      style.textAlign = source.textAlign || "";
      style.whiteSpace = source.whiteSpace || "";
      style.textDecoration = source.textDecoration || "";
      style.textTransform = source.textTransform || "";
      style.letterSpacing = source.letterSpacing || "";
      style.wordSpacing = source.wordSpacing || "";
      style.lineHeight = source.lineHeight || "";

      // apply html
      node.innerHTML = this._htmlContent;

      // store values
      this._cachedPreferredInnerWidth = node.scrollWidth;
      this._cachedPreferredInnerHeight = node.scrollHeight;
    },







    /*
    ---------------------------------------------------------------------------
      PREFERRED DIMENSIONS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _computePreferredInnerWidth : function()
    {
      this._computeObjectNeededDimensions();
      return this._cachedPreferredInnerWidth;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _computePreferredInnerHeight : function()
    {
      this._computeObjectNeededDimensions();
      return this._cachedPreferredInnerHeight;
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT APPLY
    ---------------------------------------------------------------------------
    */


    _patchGeckoHtml : function(html, inner) {
      return "<div style='float:left;width:" + (inner-10) + "px;overflow:hidden;white-space:nowrap'>" + html + "</div><span style='float:left'>&hellip;</span>";
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    _postApply : function()
    {
      var html = this._htmlContent;
      var element = this._getTargetNode();

      if (html == null)
      {
        element.innerHTML = "";
        return;
      }

      if (this.getMnemonic())
      {
        if (this._mnemonicTest.test(html))
        {
          html = RegExp.$1 + "<span style=\"text-decoration:underline\">" + RegExp.$7 + "</span>" + RegExp.rightContext;
          this._htmlMode = true;
        }
        else
        {
          html += " (" + this.getMnemonic() + ")";
        }
      }

      var style = element.style;

      if (this.getInnerWidth() < this.getPreferredInnerWidth())
      {
        style.overflow = "hidden";

        if (qx.core.Variant.isSet("qx.client", "mshtml|webkit"))
        {
          style.textOverflow = "ellipsis";
        }
        else if (qx.core.Variant.isSet("qx.client", "opera"))
        {
          style.OTextOverflow = "ellipsis";
        }
        else if (qx.core.Variant.isSet("qx.client", "gecko"))
        {
          html = this._patchGeckoHtml(html, this.getInnerWidth());
          this._htmlMode = true;
        }
      }
      else
      {
        style.overflow = "";

        if (qx.core.Variant.isSet("qx.client", "mshtml|webkit"))
        {
          style.textOverflow = "";
        }
        else if (qx.core.Variant.isSet("qx.client", "opera"))
        {
          style.OTextOverflow = "";
        }
      }

      if (this._htmlMode)
      {
        element.innerHTML = html;
      }
      else
      {
        try {
          qx.dom.Element.setTextContent(element, html);
        } catch(ex) {
          element.innerHTML = html;
        }
      }
    }
  }
});
