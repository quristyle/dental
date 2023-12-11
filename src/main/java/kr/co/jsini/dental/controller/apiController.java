package kr.co.jsini.dental.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import kr.co.jsini.dental.service.ApiService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
public class ApiController {
	
    /*
	@RequestMapping("/api")
	public String mainPage(Model model, @RequestParam Map<String, String> params) {
        model.addAttribute("data", "jjjjjjjjjj");
		return "content/index";
	}
    */

	@Autowired
	private ApiService apiService;

	@RequestMapping("/api")
	public Object projectInfo(Model model, @RequestParam Map<String, String> params) {
		
		log.info("model : {} ", model);		
		log.info("params : {} ", params);

		JsonObject jo = apiService.getProjectInfo(params);

		return jo;

	}
	

}