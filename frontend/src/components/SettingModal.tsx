import type { Dispatch, SetStateAction } from "react";
import { FILTER_ITEMS } from "../constants/filterDefinitions";
import { SUMMARY_ITEMS } from "../constants/summaryDefinitions";
import type { FilterCategoryId, SummaryId } from "../Types";

type Props = {
	open: boolean;
	onClose: () => void;
	visibleSummaryItems: Record<SummaryId, boolean>;
	setVisibleSummaryItems: Dispatch<SetStateAction<Record<SummaryId, boolean>>>;
	visibleFilterItems: Record<FilterCategoryId, boolean>;
	setVisibleFilterItems: Dispatch<
		SetStateAction<Record<FilterCategoryId, boolean>>
	>;
};
const SettingModal = ({
	open,
	onClose,
	visibleSummaryItems,
	setVisibleSummaryItems,
	visibleFilterItems,
	setVisibleFilterItems,
}: Props) => {
	return (
		<>
			{open && (
				<div className="modal" onClick={onClose}>
					<button className="close">×</button>
					<div className="settingModal" onClick={(e) => e.stopPropagation()}>
						<h3>サマリー表示設定</h3>
						{SUMMARY_ITEMS.map((item) => (
							<label key={item.id}>
								<input
									type="checkbox"
									checked={visibleSummaryItems[item.id]}
									onChange={(e) =>
										setVisibleSummaryItems((prev) => ({
											...prev,
											[item.id]: e.target.checked,
										}))
									}
								/>
								{item.label}
							</label>
						))}
						<h3>フィルター表示設定</h3>
						{FILTER_ITEMS.map((item) => (
							<label key={item.id}>
								<input
									type="checkbox"
									checked={visibleFilterItems[item.id]}
									onChange={(e) =>
										setVisibleFilterItems((prev) => ({
											...prev,
											[item.id]: e.target.checked,
										}))
									}
								/>
								{item.label}
							</label>
						))}
					</div>
				</div>
			)}
		</>
	);
};
export default SettingModal;
