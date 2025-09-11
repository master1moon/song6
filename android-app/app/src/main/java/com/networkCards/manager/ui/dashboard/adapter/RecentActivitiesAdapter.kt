package com.networkCards.manager.ui.dashboard.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.networkCards.manager.R
import com.networkCards.manager.databinding.ItemRecentActivityBinding
import com.networkCards.manager.ui.dashboard.RecentActivity
import com.networkCards.manager.ui.dashboard.ActivityType

/**
 * محول الأنشطة الحديثة
 * يعرض قائمة الأنشطة الحديثة في لوحة التحكم
 */
class RecentActivitiesAdapter(
    private val onActivityClick: (RecentActivity) -> Unit
) : ListAdapter<RecentActivity, RecentActivitiesAdapter.ActivityViewHolder>(ActivityDiffCallback()) {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ActivityViewHolder {
        val binding = ItemRecentActivityBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ActivityViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: ActivityViewHolder, position: Int) {
        val activity = getItem(position)
        holder.bind(activity)
    }
    
    /**
     * ViewHolder للنشاط
     */
    inner class ActivityViewHolder(
        private val binding: ItemRecentActivityBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        
        fun bind(activity: RecentActivity) {
            binding.apply {
                // الأيقونة
                iconActivity.apply {
                    setImageResource(activity.icon)
                    setColorFilter(getActivityColor(activity.type))
                }
                
                // العنوان
                textActivityTitle.text = activity.title
                
                // العنوان الفرعي
                textActivitySubtitle.text = activity.subtitle
                
                // الوقت
                textActivityTime.text = activity.timestamp
                
                // المبلغ (إذا كان متاحاً)
                textActivityAmount.apply {
                    if (activity.amount != null) {
                        text = activity.amount
                        visibility = android.view.View.VISIBLE
                        setTextColor(getAmountColor(activity.type))
                    } else {
                        visibility = android.view.View.GONE
                    }
                }
                
                // مؤشر نوع النشاط
                indicatorActivityType.setCardBackgroundColor(getActivityColor(activity.type))
                
                // معالج النقر
                root.setOnClickListener { onActivityClick(activity) }
                
                // تأثيرات Material Design
                root.apply {
                    isClickable = true
                    isFocusable = true
                    foreground = ContextCompat.getDrawable(
                        context,
                        android.R.drawable.list_selector_background
                    )
                }
            }
        }
        
        /**
         * الحصول على لون نوع النشاط
         */
        private fun getActivityColor(activityType: ActivityType): Int {
            return ContextCompat.getColor(
                binding.root.context,
                when (activityType) {
                    ActivityType.SALE -> R.color.success
                    ActivityType.PAYMENT -> R.color.info
                    ActivityType.NEW_STORE -> R.color.primary
                    ActivityType.NEW_PACKAGE -> R.color.secondary
                    ActivityType.EXPENSE -> R.color.warning
                }
            )
        }
        
        /**
         * الحصول على لون المبلغ
         */
        private fun getAmountColor(activityType: ActivityType): Int {
            return ContextCompat.getColor(
                binding.root.context,
                when (activityType) {
                    ActivityType.SALE, ActivityType.PAYMENT -> R.color.success
                    ActivityType.EXPENSE -> R.color.error
                    else -> R.color.on_surface
                }
            )
        }
    }
}

/**
 * DiffCallback لتحسين الأداء
 */
class ActivityDiffCallback : DiffUtil.ItemCallback<RecentActivity>() {
    override fun areItemsTheSame(oldItem: RecentActivity, newItem: RecentActivity): Boolean {
        return oldItem.id == newItem.id
    }
    
    override fun areContentsTheSame(oldItem: RecentActivity, newItem: RecentActivity): Boolean {
        return oldItem == newItem
    }
}