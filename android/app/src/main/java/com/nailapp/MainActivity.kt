package com.nailapp

import android.content.res.Configuration
import android.content.res.Resources
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "NailApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * Override getResources() to prevent text scaling based on system font size settings.
   * This ensures text size is always controlled by the app code, not device settings.
   */
  override fun getResources(): Resources {
    val res = super.getResources()
    val configuration = Configuration(res.configuration)
    configuration.fontScale = 1.0f
    return createConfigurationContext(configuration).resources
  }
}
