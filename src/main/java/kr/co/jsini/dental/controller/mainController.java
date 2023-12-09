package kr.co.jsini.dental.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class mainController {
	
    
	@RequestMapping("/{id}")
	public String mainPage(Model model, @PathVariable(value = "id", required = false) String id) {
        model.addAttribute("data", ""+id);
		return "content/"+id;
	}
    
	
	@RequestMapping("")
	public String main(Model model) {
        model.addAttribute("data", "index");
		return "content/index";
	}

}