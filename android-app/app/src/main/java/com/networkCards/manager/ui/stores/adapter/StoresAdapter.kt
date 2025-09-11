package com.networkCards.manager.ui.stores.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import android.view.animation.AnimationUtils
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.networkCards.manager.R
import com.networkCards.manager.databinding.ItemStoreBinding
import com.networkCards.manager.data.model.Store
import com.networkCards.manager.util.CurrencyFormatter
import com.networkCards.manager.util.DateFormatter

/**
 * محول قائمة المحلات
 * يعرض المحلات في RecyclerView مع تصميم Material
 */
class StoresAdapter(
    private val onStoreClick: (Store) -> Unit,
    private val onCallClick: (Store) -> Unit,
    private val onLocationClick: (Store) -> Unit,
    private val onEditClick: (Store) -> Unit
) : ListAdapter<Store, StoresAdapter.StoreViewHolder>(StoreDiffCallback()) {
    
    private var lastPosition = -1
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): StoreViewHolder {
        val binding = ItemStoreBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return StoreViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: StoreViewHolder, position: Int) {
        val store = getItem(position)
        holder.bind(store)
        
        // تأثير الظهور المتدرج
        setAnimation(holder.itemView, position)
    }
    
    /**
     * إضافة تأثير الظهور المتدرج
     */
    private fun setAnimation(view: android.view.View, position: Int) {
        if (position > lastPosition) {
            val animation = AnimationUtils.loadAnimation(view.context, R.anim.item_slide_in_bottom)
            view.startAnimation(animation)
            lastPosition = position
        }
    }
    
    /**
     * الحصول على محل في موضع محدد
     */
    fun getStoreAt(position: Int): Store = getItem(position)
    
    /**
     * استعادة محل محذوف
     */
    fun restoreStore(store: Store, position: Int) {
        val currentList = currentList.toMutableList()
        currentList.add(position, store)
        submitList(currentList)
    }
    
    /**
     * ViewHolder للمحل
     */
    inner class StoreViewHolder(
        private val binding: ItemStoreBinding
    ) : RecyclerView.ViewHolder(binding.root) {
        
        fun bind(store: Store) {
            binding.apply {
                // المعلومات الأساسية
                textStoreName.text = store.name
                textStorePhone.text = store.phone ?: "لا يوجد رقم"
                textStoreAddress.text = store.address ?: "لا يوجد عنوان"
                
                // نوع السعر
                chipPriceType.apply {
                    text = store.priceType.arabicName
                    setChipBackgroundColorResource(getPriceTypeColor(store.priceType))
                }
                
                // الرصيد
                textStoreBalance.apply {
                    text = CurrencyFormatter.format(store.balance)
                    setTextColor(getBalanceColor(store.balance))
                }
                
                // حالة المحل
                indicatorStatus.apply {
                    setCardBackgroundColor(store.getStatusColor())
                    visibility = if (store.isActive) android.view.View.VISIBLE else android.view.View.GONE
                }
                
                // أيقونة الأولوية
                iconPriority.apply {
                    visibility = if (store.priority > 1) android.view.View.VISIBLE else android.view.View.GONE
                    setImageResource(
                        when (store.priority) {
                            2 -> R.drawable.ic_vip
                            1 -> R.drawable.ic_important
                            else -> R.drawable.ic_normal
                        }
                    )
                }
                
                // تاريخ آخر نشاط
                textLastActivity.text = getLastActivityText(store)
                
                // معالجات الأحداث
                root.setOnClickListener { onStoreClick(store) }
                
                buttonCall.apply {
                    isEnabled = !store.phone.isNullOrBlank()
                    setOnClickListener { onCallClick(store) }
                }
                
                buttonLocation.apply {
                    isEnabled = !store.address.isNullOrBlank() || 
                               (store.latitude != null && store.longitude != null)
                    setOnClickListener { onLocationClick(store) }
                }
                
                buttonEdit.setOnClickListener { onEditClick(store) }
                
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
         * الحصول على لون نوع السعر
         */
        private fun getPriceTypeColor(priceType: com.networkCards.manager.data.model.PriceType): Int {
            return when (priceType) {
                com.networkCards.manager.data.model.PriceType.RETAIL -> R.color.price_retail
                com.networkCards.manager.data.model.PriceType.WHOLESALE -> R.color.price_wholesale
                com.networkCards.manager.data.model.PriceType.DISTRIBUTOR -> R.color.price_distributor
            }
        }
        
        /**
         * الحصول على لون الرصيد
         */
        private fun getBalanceColor(balance: Double): Int {
            return ContextCompat.getColor(
                binding.root.context,
                when {
                    balance > 0 -> R.color.balance_positive // أخضر للرصيد الإيجابي
                    balance < 0 -> R.color.balance_negative // أحمر للرصيد السلبي
                    else -> R.color.balance_zero // رمادي للرصيد الصفر
                }
            )
        }
        
        /**
         * الحصول على نص آخر نشاط
         */
        private fun getLastActivityText(store: Store): String {
            return when {
                store.lastSaleDate != null -> "آخر بيع: ${DateFormatter.formatRelative(store.lastSaleDate)}"
                store.lastPaymentDate != null -> "آخر دفعة: ${DateFormatter.formatRelative(store.lastPaymentDate)}"
                else -> "لا يوجد نشاط حديث"
            }
        }
    }
}

/**
 * DiffCallback لتحسين الأداء
 */
class StoreDiffCallback : DiffUtil.ItemCallback<Store>() {
    override fun areItemsTheSame(oldItem: Store, newItem: Store): Boolean {
        return oldItem.id == newItem.id
    }
    
    override fun areContentsTheSame(oldItem: Store, newItem: Store): Boolean {
        return oldItem == newItem
    }
    
    override fun getChangePayload(oldItem: Store, newItem: Store): Any? {
        // يمكن إضافة payload للتحديثات الجزئية
        return when {
            oldItem.balance != newItem.balance -> "balance_changed"
            oldItem.name != newItem.name -> "name_changed"
            oldItem.isActive != newItem.isActive -> "status_changed"
            else -> null
        }
    }
}