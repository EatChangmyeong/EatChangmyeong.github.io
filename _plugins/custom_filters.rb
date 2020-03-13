module Jekyll::CustomFilter
	def korean_date(input)
		"#{input.year}년 #{input.mon}월 #{input.day}일 #{input.hour.to_s.rjust(2, "0")}:#{input.min.to_s.rjust(2, "0")}"
	end
end

Liquid::Template.register_filter(Jekyll::CustomFilter)