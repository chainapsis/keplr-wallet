package expo.modules.splashscreen

import android.annotation.SuppressLint
import android.content.Context
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageView

@SuppressLint("ViewConstructor")
class SplashScreenView(
  context: Context
) : FrameLayout(context) {
  var backgroundImageView: ImageView = ImageView(context).also { view ->
    view.layoutParams = LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.MATCH_PARENT
    )
  }

  val imageView: ImageView = ImageView(context).also { view ->
    view.layoutParams = LayoutParams(
      LayoutParams.MATCH_PARENT,
      LayoutParams.MATCH_PARENT
    )
  }

  init {
    layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
    isClickable = true

    addView(backgroundImageView)
    addView(imageView)
  }

  fun configureImageViewResizeMode(resizeMode: SplashScreenImageResizeMode) {
    imageView.scaleType = resizeMode.scaleType
    when (resizeMode) {
      SplashScreenImageResizeMode.NATIVE -> {}
      SplashScreenImageResizeMode.CONTAIN -> {
        imageView.adjustViewBounds = true
      }
      SplashScreenImageResizeMode.COVER -> {}
    }
  }
}
