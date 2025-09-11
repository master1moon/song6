package com.networkCards.manager.ui.packages.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import android.view.animation.AnimationUtils
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.networkCards.manager.R
import com.networkCards.manager.databinding.ItemPackageBinding
import com.networkCards.manager.data.model.Package
import com.networkCards.manager.data.model.PriceType
import com.networkCards.manager.util.CurrencyFormatter

/**
 * محول قائمة الباقات
 * يعرض الباقات في Grid Layout مع تصميم Material
 */
class PackagesAdapter(
    private val onPackageClick: (Package) -> Unit,
    private val onEditClick: (Package) -> Unit,
    private val onToggleFeaturedClick: (Package) -> Unit,
    private val onStockClick: (Package) -> Unit
) : ListAdapter<Package, PackagesAdapter.PackageViewHolder>(PackageDiffCallback()) {
    
    private var lastPosition = -1
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PackageViewHolder {
        val binding = ItemPackageBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return PackageViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: PackageViewHolder, position: Int) {
        val package = getItem(position)
        holder.bind(package)
        
        // تأثير الظهور المتدرج
        setAnimation(holder.itemView, position)
    }
    
    /**
     * إضافة تأثير الظهور المتدرج
     */
    private fun setAnimation(view: android.view.View, position: Int) {
        if (position > lastPosition) {
            val animation = AnimationUtils.loadAnimation(view.context, R.anim.item_scale_in)
            view.startAnimation(animation)
            lastPosition = position
        }
    }
    
    /**
     * الحصول على باقة في موضع محدد
     */
    fun getPackageAt(position: Int): Package = getItem(position)
    
    /**
     * استعادة باقة محذوفة
     */
    fun restorePackage(package: Package, position: Int) {
        val currentList = currentList.toMutableList()
        currentList.add(position, package)
        submitList(currentList)
    }
    
    /**
     * ViewHolder للباقة
     */
    inner class PackageViewHolder(
        private val binding: ItemPackageBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        
        fun bind(package: Package) {
            binding.apply {
                // المعلومات الأساسية
                textPackageName.text = package.name
                textPackageDescription.text = package.description ?: "لا يوجد وصف"
                
                // الأسعار
                textRetailPrice.text = package.retailPrice?.let { CurrencyFormatter.format(it) } ?: "-"
                textWholesalePrice.text = package.wholesalePrice?.let { CurrencyFormatter.format(it) } ?: "-"
                textDistributorPrice.text = package.distributorPrice?.let { CurrencyFormatter.format(it) } ?: "-"
                
                // المخزون
                textCurrentStock.apply {
                    text = package.getFormattedStock()
                    setTextColor(package.getStockStatusColor())
                }
                
                // شريط تقدم المخزون
                progressStock.apply {
                    max = package.maxStockLevel
                    progress = package.currentStock
                    
                    // تلوين الشريط حسب حالة المخزون
                    progressTintList = ContextCompat.getColorStateList(
                        context, 
                        when {
                            package.currentStock <= 0 -> R.color.stock_out
                            package.currentStock <= package.minStockLevel -> R.color.stock_low
                            else -> R.color.stock_normal
                        }
                    )
                }
                
                // الفئة
                chipCategory.apply {
                    text = package.category ?: "عام"
                    visibility = if (package.category != null) android.view.View.VISIBLE else android.view.View.GONE
                }
                
                // الباركود
                textBarcode.apply {
                    text = package.barcode ?: "لا يوجد باركود"
                    visibility = if (package.barcode != null) android.view.View.VISIBLE else android.view.View.GONE
                }
                
                // حالة التمييز
                iconFeatured.visibility = if (package.isFeatured) android.view.View.VISIBLE else android.view.View.GONE
                
                // حالة النشاط
                overlayInactive.visibility = if (!package.isActive) android.view.View.VISIBLE else android.view.View.GONE
                
                // إحصائيات المبيعات
                if (package.totalSold > 0) {
                    textSalesStats.text = "مُبيع: ${package.totalSold} كرت"
                    textSalesStats.visibility = android.view.View.VISIBLE
                } else {
                    textSalesStats.visibility = android.view.View.GONE
                }
                
                // معالجات الأحداث
                root.setOnClickListener { onPackageClick(package) }
                
                buttonEdit.setOnClickListener { onEditClick(package) }
                
                buttonToggleFeatured.apply {
                    setImageResource(
                        if (package.isFeatured) R.drawable.ic_star_filled else R.drawable.ic_star_outline
                    )
                    setOnClickListener { onToggleFeaturedClick(package) }
                }
                
                buttonStock.setOnClickListener { onStockClick(package) }
                
                // تأثيرات Material Design
                root.apply {
                    isClickable = true
                    isFocusable = true
                    foreground = ContextCompat.getDrawable(
                        context,
                        android.R.drawable.list_selector_background
                    )
                }
                
                // تأثير النبض للمخزون المنخفض
                if (package.isLowStock()) {
                    val pulseAnimation = AnimationUtils.loadAnimation(context, R.anim.pulse)
                    iconStockWarning.apply {
                        visibility = android.view.View.VISIBLE
                        startAnimation(pulseAnimation)
                    }
                } else {
                    iconStockWarning.visibility = android.view.View.GONE
                }
            }
        }
    }
}

/**
 * DiffCallback لتحسين الأداء
 */
class PackageDiffCallback : DiffUtil.ItemCallback<Package>() {
    override fun areItemsTheSame(oldItem: Package, newItem: Package): Boolean {
        return oldItem.id == newItem.id
    }
    
    override fun areContentsTheSame(oldItem: Package, newItem: Package): Boolean {
        return oldItem == newItem
    }
    
    override fun getChangePayload(oldItem: Package, newItem: Package): Any? {
        return when {
            oldItem.currentStock != newItem.currentStock -> "stock_changed"
            oldItem.isFeatured != newItem.isFeatured -> "featured_changed"
            oldItem.isActive != newItem.isActive -> "status_changed"
            else -> null
        }
    }
}