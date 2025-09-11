package com.networkCards.manager.ui.dashboard.adapter

import android.animation.ValueAnimator
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.networkCards.manager.R
import com.networkCards.manager.databinding.ItemQuickStatBinding
import com.networkCards.manager.ui.dashboard.QuickStatItem
import com.networkCards.manager.ui.dashboard.StatTrend

/**
 * محول الإحصائيات السريعة
 * يعرض الإحصائيات في لوحة التحكم مع تأثيرات حركية
 */
class QuickStatsAdapter(
    private val onStatClick: (QuickStatItem) -> Unit
) : ListAdapter<QuickStatItem, QuickStatsAdapter.StatViewHolder>(StatDiffCallback()) {
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StatViewHolder {
        val binding = ItemQuickStatBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return StatViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: StatViewHolder, position: Int) {
        val stat = getItem(position)
        holder.bind(stat)
    }
    
    /**
     * ViewHolder للإحصائية
     */
    inner class StatViewHolder(
        private val binding: ItemQuickStatBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        
        fun bind(stat: QuickStatItem) {
            binding.apply {
                // الأيقونة
                iconStat.apply {
                    setImageResource(stat.icon)
                    setColorFilter(stat.color)
                }
                
                // العنوان
                textStatTitle.text = stat.title
                
                // القيمة مع تأثير العدّ التصاعدي
                animateValue(stat.value)
                
                // العنوان الفرعي
                textStatSubtitle.apply {
                    text = stat.subtitle
                    visibility = if (stat.subtitle != null) android.view.View.VISIBLE else android.view.View.GONE
                }
                
                // الاتجاه (إذا كان متاحاً)
                setupTrendIndicator(stat.trend)
                
                // لون الخلفية
                cardStat.setCardBackgroundColor(
                    ContextCompat.getColor(root.context, R.color.surface)
                )
                
                // تأثير النقر
                root.setOnClickListener { onStatClick(stat) }
                
                // تأثير الرفع عند التمرير
                cardStat.apply {
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
         * تحريك القيمة بتأثير العدّ التصاعدي
         */
        private fun animateValue(value: String) {
            // محاولة استخراج رقم من النص للتحريك
            val numericValue = value.replace(Regex("[^\\d.]"), "").toDoubleOrNull()
            
            if (numericValue != null && numericValue > 0) {
                val animator = ValueAnimator.ofFloat(0f, numericValue.toFloat())
                animator.duration = 1500
                animator.startDelay = (adapterPosition * 100).toLong() // تأخير متدرج
                
                animator.addUpdateListener { animation ->
                    val animatedValue = animation.animatedValue as Float
                    val formattedValue = if (value.contains("ريال") || value.contains("$")) {
                        com.networkCards.manager.util.CurrencyFormatter.format(animatedValue.toDouble())
                    } else {
                        String.format("%.0f", animatedValue)
                    }
                    
                    binding.textStatValue.text = formattedValue
                }
                
                animator.start()
            } else {
                // عرض النص كما هو إذا لم يكن رقمياً
                binding.textStatValue.text = value
            }
        }
        
        /**
         * إعداد مؤشر الاتجاه
         */
        private fun setupTrendIndicator(trend: StatTrend?) {
            binding.layoutTrend.apply {
                if (trend != null) {
                    visibility = android.view.View.VISIBLE
                    
                    // أيقونة الاتجاه
                    binding.iconTrend.apply {
                        setImageResource(
                            if (trend.isPositive) R.drawable.ic_trending_up else R.drawable.ic_trending_down
                        )
                        setColorFilter(
                            ContextCompat.getColor(
                                context,
                                if (trend.isPositive) R.color.success else R.color.error
                            )
                        )
                    }
                    
                    // نسبة التغيير
                    binding.textTrendPercentage.apply {
                        text = "${String.format("%.1f", trend.percentage)}%"
                        setTextColor(
                            ContextCompat.getColor(
                                context,
                                if (trend.isPositive) R.color.success else R.color.error
                            )
                        )
                    }
                } else {
                    visibility = android.view.View.GONE
                }
            }
        }
    }
}

/**
 * DiffCallback لتحسين الأداء
 */
class StatDiffCallback : DiffUtil.ItemCallback<QuickStatItem>() {
    override fun areItemsTheSame(oldItem: QuickStatItem, newItem: QuickStatItem): Boolean {
        return oldItem.type == newItem.type
    }
    
    override fun areContentsTheSame(oldItem: QuickStatItem, newItem: QuickStatItem): Boolean {
        return oldItem == newItem
    }
}