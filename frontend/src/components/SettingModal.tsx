import type { Dispatch, SetStateAction } from "react";
import {
	ASPECT_RATIO_ITEMS,
	FILTER_ITEMS,
} from "../constants/filterDefinitions";
import { SUMMARY_ITEMS } from "../constants/summaryDefinitions";
import type { FilterId, SummaryId, VisibleAspectRatioId } from "../Types";

type Props = {
	open: boolean;
	onClose: () => void;
	visibleSummaryItems: Record<SummaryId, boolean>;
	setVisibleSummaryItems: Dispatch<SetStateAction<Record<SummaryId, boolean>>>;

	visibleFilterItems: Record<FilterId, boolean>;
	setVisibleFilterItems: Dispatch<SetStateAction<Record<FilterId, boolean>>>;

	visibleAspectRatioItems: Record<VisibleAspectRatioId, boolean>;
	setVisibleAspectRatioItems: Dispatch<
		SetStateAction<Record<VisibleAspectRatioId, boolean>>
	>;
};
const SettingModal = ({
	open,
	onClose,
	visibleSummaryItems,
	setVisibleSummaryItems,
	visibleFilterItems,
	setVisibleFilterItems,
	visibleAspectRatioItems,
	setVisibleAspectRatioItems,
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
						{ASPECT_RATIO_ITEMS.filter((item) => item.id !== "all").map(
							(item) => (
								<label key={item.id}>
									<input
										type="checkbox"
										checked={visibleAspectRatioItems[item.id]}
										onChange={(e) =>
											setVisibleAspectRatioItems((prev) => ({
												...prev,
												[item.id]: e.target.checked,
											}))
										}
									/>
									{item.label}
								</label>
							),
						)}
					</div>
				</div>
			)}
		</>
	);
};
export default SettingModal;
